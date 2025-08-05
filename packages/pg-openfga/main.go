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

// _check is the internal implementation for checking permissions.
func _check(storeName, user, relation, object, contextualTuplesJSON string) (bool, error) {
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
	var contextualTuplesBytes []byte

	nargs := fi.nargs
	if nargs == 4 {
		err := funcInfo.Scan(&storeName, &user, &relation, &object)
		if err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
	} else if nargs == 5 {
		// Assuming the 5th arg for the generic `check` is a single jsonb string
		err := funcInfo.Scan(&storeName, &user, &relation, &object, &contextualTuplesBytes)
		if err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments with contextual tuples: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
		contextualTuples = string(contextualTuplesBytes)
	} else {
		pgxs.LogNotice(fmt.Sprintf("[openfga] check function called with invalid number of arguments: %d", nargs))
		return Datum(pgxs.ToDatum(false))
	}

	allowed, err := _check(storeName, user, relation, object, contextualTuples)
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] check failed: %v", err))
		return Datum(pgxs.ToDatum(false))
	}
	return Datum(pgxs.ToDatum(allowed))
}

//export checkCore
func checkCore(fi *FuncInfo) Datum {
	funcInfo := convFI(fi)
	var user, relation, object string
	var contextualTuples []string
	tuplesJSON := ""

	nargs := fi.nargs
	if nargs == 3 {
		err := funcInfo.Scan(&user, &relation, &object)
		if err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments for checkCore: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
	} else if nargs == 4 {
		err := funcInfo.Scan(&user, &relation, &object, &contextualTuples)
		if err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments for checkCore with contextual tuples: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
		if len(contextualTuples) > 0 {
			tuplesJSON = "[" + strings.Join(contextualTuples, ",") + "]"
		}
	} else {
		pgxs.LogNotice(fmt.Sprintf("[openfga] checkCore function called with invalid number of arguments: %d", nargs))
		return Datum(pgxs.ToDatum(false))
	}

	allowed, err := _check("core", user, relation, object, tuplesJSON)
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] core check failed: %v", err))
		return Datum(pgxs.ToDatum(false))
	}

	return Datum(pgxs.ToDatum(allowed))
}

//export checkCustom
func checkCustom(fi *FuncInfo) Datum {
	funcInfo := convFI(fi)
	var user, relation, object string
	var contextualTuples []string
	tuplesJSON := ""

	nargs := fi.nargs
	if nargs == 3 {
		err := funcInfo.Scan(&user, &relation, &object)
		if err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments for checkCustom: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
	} else if nargs == 4 {
		err := funcInfo.Scan(&user, &relation, &object, &contextualTuples)
		if err != nil {
			pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments for checkCustom with contextual tuples: %v", err))
			return Datum(pgxs.ToDatum(false))
		}
		if len(contextualTuples) > 0 {
			tuplesJSON = "[" + strings.Join(contextualTuples, ",") + "]"
		}
	} else {
		pgxs.LogNotice(fmt.Sprintf("[openfga] checkCustom function called with invalid number of arguments: %d", nargs))
		return Datum(pgxs.ToDatum(false))
	}

	allowed, err := _check("custom", user, relation, object, tuplesJSON)
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] custom check failed: %v", err))
		return Datum(pgxs.ToDatum(false))
	}

	return Datum(pgxs.ToDatum(allowed))
}

func main() {} // required with -buildmode=c-shared
