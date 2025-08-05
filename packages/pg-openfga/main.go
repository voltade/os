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
	"fmt"
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

//export check
func check(fi *FuncInfo) Datum {
	funcInfo := convFI(fi)
	var storeName, user, relation, object string
	err := funcInfo.Scan(&storeName, &user, &relation, &object)
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] failed to scan arguments: %v", err))
		return Datum(pgxs.ToDatum(false))
	}

	// Create a context with a 5-second timeout.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel() // Important to release resources

	client, storeId, err := getGrpcClient(ctx, storeName)
	if err != nil {
		pgxs.LogNotice(fmt.Sprintf("[openfga] failed to get gRPC client: %v", err))
		return Datum(pgxs.ToDatum(false))
	}

	resp, err := client.Check(ctx, &pb.CheckRequest{
		StoreId: storeId,
		TupleKey: &pb.CheckRequestTupleKey{
			User: user, Relation: relation, Object: object,
		},
	})

	if err != nil {
		// This will now fire after 5 seconds if the server is unreachable
		pgxs.LogNotice(fmt.Sprintf("[openfga] gRPC call failed: %v", err))
		// The connection might be stale, remove it from the cache.
		removeClient(storeName)
		return Datum(pgxs.ToDatum(false))
	}

	return Datum(pgxs.ToDatum(resp.GetAllowed()))
}

func convFI(funcInfo *FuncInfo) *pgxs.FuncInfo {
	return (*pgxs.FuncInfo)(unsafe.Pointer(funcInfo))
}

func main() {} // required with -buildmode=c-shared
