package main

/*
#cgo LDFLAGS: -shared
#cgo darwin LDFLAGS: -undefined dynamic_lookup

// C.Datum
#include "postgres.h"

// C.FunctionCallBaseData
#include "fmgr.h"

// Expose the C GUC variable to Go
extern char *server_address;
*/
import "C"
import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"
	"unsafe"

	"github.com/jchappelow/go-pgxs"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	openfgav1 "buf.build/gen/go/openfga/api/grpc/go/openfga/v1/openfgav1grpc"
	pb "buf.build/gen/go/openfga/api/protocolbuffers/go/openfga/v1"
)

type FuncInfo = C.FunctionCallInfoBaseData
type Datum = C.Datum

func convFI(funcInfo *FuncInfo) *pgxs.FuncInfo {
	return (*pgxs.FuncInfo)(unsafe.Pointer(funcInfo))
}

type FgaClientCache struct {
	client  openfgav1.OpenFGAServiceClient
	conn    *grpc.ClientConn
	storeId string
}

var (
	// Map to hold reusable gRPC connections and store IDs
	clients   = make(map[string]FgaClientCache)
	clientsMu sync.Mutex
)

// getGrpcClient gets a reusable gRPC client for a given address and store name.
func getGrpcClient(ctx context.Context, storeName string) (openfgav1.OpenFGAServiceClient, string, error) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	if cached, ok := clients[storeName]; ok {
		return cached.client, cached.storeId, nil
	}

	serverAddress := C.GoString(C.server_address)
	conn, err := grpc.NewClient(serverAddress, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, "", fmt.Errorf("failed to create gRPC client: %w", err)
	}

	client := openfgav1.NewOpenFGAServiceClient(conn)

	stores, err := client.ListStores(ctx, &pb.ListStoresRequest{})
	if err != nil {
		conn.Close() // Prevent connection leak
		return nil, "", fmt.Errorf("failed to list stores: %w", err)
	}
	var store *pb.Store
	for _, s := range stores.GetStores() {
		if s.GetName() == storeName && s.GetDeletedAt() == nil {
			store = s
			break
		}
	}
	if store == nil {
		conn.Close() // Prevent connection leak
		return nil, "", fmt.Errorf("store '%s' not found or has been deleted", storeName)
	}

	clients[storeName] = FgaClientCache{client: client, conn: conn, storeId: store.GetId()}
	return client, store.GetId(), nil
}

// removeClient closes the gRPC connection and removes it from the cache.
func removeClient(storeName string) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	if cached, ok := clients[storeName]; ok {
		cached.conn.Close()
		delete(clients, storeName)
	}
}

func _perform_write(storeName string, writeTuplesJSON string, deleteTuplesJson string) (bool, error) {
	// Create a context with a 5-second timeout.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel() // Important to release resources
	client, storeId, err := getGrpcClient(ctx, storeName)
	if err != nil {
		return false, fmt.Errorf("failed to get gRPC client: %w", err)
	}
	var writeTuples []*pb.TupleKey
	if strings.TrimSpace(writeTuplesJSON) != "" {
		if err := json.Unmarshal([]byte(writeTuplesJSON), &writeTuples); err != nil {
			return false, fmt.Errorf("failed to unmarshal write tuples: %w", err)
		}
	}
	var deleteTuples []*pb.TupleKeyWithoutCondition
	if strings.TrimSpace(deleteTuplesJson) != "" {
		if err := json.Unmarshal([]byte(deleteTuplesJson), &deleteTuples); err != nil {
			return false, fmt.Errorf("failed to unmarshal delete tuples: %w", err)
		}
	}
	writeRequest := &pb.WriteRequest{
		StoreId: storeId,
	}
	if len(writeTuples) > 0 {
		writeRequest.Writes = &pb.WriteRequestWrites{
			TupleKeys: writeTuples,
		}
	}
	if len(deleteTuples) > 0 {
		writeRequest.Deletes = &pb.WriteRequestDeletes{
			TupleKeys: deleteTuples,
		}
	}
	_, err = client.Write(ctx, writeRequest)
	if err != nil {
		// The connection might be stale, remove it from the cache.
		removeClient(storeName)
		return false, fmt.Errorf("gRPC call failed: %w", err)
	}
	return true, nil
}

//export write_tuples
func write_tuples(fi *FuncInfo) Datum {
	funcInfo := convFI(fi)
	var storeName, writeTuples string
	nargs := fi.nargs
	if nargs == 2 {
		if err := funcInfo.Scan(&storeName, &writeTuples); err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments with write tuples: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
	} else {
		pgxs.LogNotice(fmt.Sprintf("[openfga] write function called with invalid number of arguments: %d", nargs))
		return Datum(pgxs.ToDatum(false))
	}
	success, err := _perform_write(storeName, writeTuples, "[]")
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] write failed: %v", err))
		return Datum(pgxs.ToDatum(false))
	}
	return Datum(pgxs.ToDatum(success))
}

//export delete_tuples
func delete_tuples(fi *FuncInfo) Datum {
	funcInfo := convFI(fi)
	var storeName, deleteTuples string
	nargs := fi.nargs
	if nargs == 2 {
		if err := funcInfo.Scan(&storeName, &deleteTuples); err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments with delete tuples: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
	} else {
		pgxs.LogNotice(fmt.Sprintf("[openfga] delete function called with invalid number of arguments: %d", nargs))
		return Datum(pgxs.ToDatum(false))
	}
	success, err := _perform_write(storeName, "[]", deleteTuples)
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] delete failed: %v", err))
		return Datum(pgxs.ToDatum(false))
	}
	return Datum(pgxs.ToDatum(success))
}

// _perform_check is the internal implementation for checking permissions.
func _perform_check(storeName, user, relation, object, contextualTuplesJSON string) (bool, error) {
	// Create a context with a 5-second timeout.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel() // Important to release resources
	client, storeId, err := getGrpcClient(ctx, storeName)
	if err != nil {
		return false, fmt.Errorf("failed to get gRPC client: %w", err)
	}
	checkRequest := &pb.CheckRequest{
		StoreId: storeId,
		TupleKey: &pb.CheckRequestTupleKey{
			User:     user,
			Relation: relation,
			Object:   object,
		},
	}
	if contextualTuplesJSON != "" {
		var contextualTuples []*pb.TupleKey
		if err := json.Unmarshal([]byte(contextualTuplesJSON), &contextualTuples); err != nil {
			return false, fmt.Errorf("failed to unmarshal contextual tuples: %w", err)
		}
		if len(contextualTuples) > 0 {
			checkRequest.ContextualTuples = &pb.ContextualTupleKeys{
				TupleKeys: contextualTuples,
			}
		}
	}
	resp, err := client.Check(ctx, checkRequest)
	if err != nil {
		// The connection might be stale, remove it from the cache.
		removeClient(storeName)
		return false, fmt.Errorf("gRPC call failed: %w", err)
	}
	return resp.GetAllowed(), nil
}

//export check
func check(fi *FuncInfo) Datum {
	funcInfo := convFI(fi)
	var storeName, user, relation, object, contextualTuples string

	nargs := fi.nargs
	if nargs == 5 {
		if err := funcInfo.Scan(&storeName, &user, &relation, &object, &contextualTuples); err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments with contextual tuples: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
	} else {
		pgxs.LogNotice(fmt.Sprintf("[openfga] check function called with invalid number of arguments: %d", nargs))
		return Datum(pgxs.ToDatum(false))
	}

	allowed, err := _perform_check(storeName, user, relation, object, contextualTuples)
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] check failed: %v", err))
		return Datum(pgxs.ToDatum(false))
	}
	return Datum(pgxs.ToDatum(allowed))
}

func main() {} // required with -buildmode=c-shared
