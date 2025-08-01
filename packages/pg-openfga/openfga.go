package main

/*
#cgo LDFLAGS: -shared
#cgo darwin LDFLAGS: -undefined dynamic_lookup

// C.Datum
#include "postgres.h"

// C.FunctionCallBaseData
#include "fmgr.h"
*/
import "C"
import (
	"context"
	"time"
	"unsafe"

	"github.com/jchappelow/go-pgxs"
	openfgaV1 "github.com/openfga/api/proto/openfga/v1"
	parser "github.com/openfga/language/pkg/go/transformer"
	openfga "github.com/openfga/openfga/pkg/server"
	"github.com/openfga/openfga/pkg/storage/memory"
)

var (
	fgaServer     *openfga.Server
	fgaStore      *openfgaV1.CreateStoreResponse
	fgaAuthzModel *openfgaV1.WriteAuthorizationModelResponse
)

func init() {
	var err error
	datastore := memory.New() // other supported datastores include Postgres, MySQL and SQLite

	fgaServer, err = openfga.NewServerWithOpts(openfga.WithDatastore(datastore),
		openfga.WithCheckQueryCacheEnabled(true),
		// more options available
		openfga.WithShadowListObjectsQueryEnabled(true),
		openfga.WithShadowListObjectsQueryTimeout(17*time.Millisecond),
		openfga.WithShadowListObjectsQuerySamplePercentage(50),
		openfga.WithShadowListObjectsQueryMaxDeltaItems(20),
	)
	if err != nil {
		panic(err)
	}

	// create store
	fgaStore, err = fgaServer.CreateStore(context.Background(),
		&openfgaV1.CreateStoreRequest{Name: "demo"})
	if err != nil {
		panic(err)
	}

	model := parser.MustTransformDSLToProto(`
	model
		schema 1.1

	type user

	type document
		relations
			define reader: [user]`)

	// write the model to the store
	fgaAuthzModel, err = fgaServer.WriteAuthorizationModel(context.Background(), &openfgaV1.WriteAuthorizationModelRequest{
		StoreId:         fgaStore.GetId(),
		TypeDefinitions: model.GetTypeDefinitions(),
		Conditions:      model.GetConditions(),
		SchemaVersion:   model.GetSchemaVersion(),
	})
	if err != nil {
		panic(err)
	}

	// write tuples to the store
	_, err = fgaServer.Write(context.Background(), &openfgaV1.WriteRequest{
		StoreId: fgaStore.GetId(),
		Writes: &openfgaV1.WriteRequestWrites{
			TupleKeys: []*openfgaV1.TupleKey{
				{Object: "document:budget", Relation: "reader", User: "user:anne"},
			},
		},
		Deletes: nil,
	})
	if err != nil {
		panic(err)
	}
}

type funcInfo = C.FunctionCallInfoBaseData
type datum = C.Datum

// NOTE: if we used pgxs.Datum in the function signature, the compiler would not
// allow it because it is a "Go type". It's in a different packages, so it
// understandably does no realize that they are the same structure.

//export Check
func Check(fcinfo *funcInfo) datum {
	fi := convFI(fcinfo)
	var user, relation, object string
	err := fi.Scan(&user, &relation, &object)
	if err != nil {
		pgxs.LogError(err.Error())
		return datum(pgxs.ToDatum(false))
	}

	// make an authorization check
	checkResponse, err := fgaServer.Check(context.Background(), &openfgaV1.CheckRequest{
		StoreId:              fgaStore.GetId(),
		AuthorizationModelId: fgaAuthzModel.GetAuthorizationModelId(), // optional, but recommended for speed
		TupleKey: &openfgaV1.CheckRequestTupleKey{
			User:     user,
			Relation: relation,
			Object:   object,
		},
	})
	if err != nil {
		pgxs.LogError(err.Error())
		return datum(pgxs.ToDatum(false))
	}

	return datum(pgxs.ToDatum(checkResponse.GetAllowed()))
}

func convFI(fcinfo *funcInfo) *pgxs.FuncInfo {
	return (*pgxs.FuncInfo)(unsafe.Pointer(fcinfo))
}

func main() {} // required with -buildmode=c-shared
