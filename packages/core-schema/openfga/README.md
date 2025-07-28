# OpenFGA Modular Model Sample Store

## Use Case

This example models a common sales workflow that is generic enough to be reused across different organizations. The requirements of the authorization model are as follows:

### Teams

Organizations usually have one or more teams (a.k.a. departments) that manage different aspects of the business operations. The scope and operational context of each team is usually clearly defined by the business logic.

For this example, some useful teams include Inventory, Sales, Finance, etc.

Team roles:

- **Member**: Users can be part (a member of) one or more teams.
- **Manager**: A general role that has managerial roles over other members of the team.
  Large teams can have multi-level managers. If there are various fine-grained permissions/roles for these levels, they should be modelled separately per business rules.
- **Head**: A general top-level role that is granted all available team-based permissions.

### Resources

For this example, common resources include the products being sold, the cRFQs (centralized / collective Request for Quotation) being created / approved, the sales orders tracking the sales follow-through, the sales invoice, etc.

Based on the teams and resources mentioned above, we can model a scenario as follows:

#### Inventory

The Inventory team controls the definition of products so as to effectively take stock.

- Members of the Inventory team should have **full (read/write) access to products**.
- Members of the Inventory team should not require access to other resources.

#### Sales

The Sales team is in charge of the sales workflow. Put simply, this means tracking the sale from cRFQ generation, to approval and sales order creation, to sales order completion.

- A member commissioned to handle the sale should be able to **select (view-only) the product(s)** to be sold when generating the cRFQ.
- Members of the Sales team should be able to **view and edit all cRFQs and sales orders**, subject to their respective statuses (omitted from this example).
- Within the Sales team, there might be various levels of approval required for each cRFQ -> sales order. For example, a manager may need to approve his/her member's quotation.

#### Finance

The Finance team handles the accounting once the sales order has been completed.

- Members of the Finance team should be able to **view all (completed) sales orders** and have **full access to invoices**.
- As part of generating invoices, the Finance team member should be able to **select (view-only) the product(s)** that have been sold.
- Within the Finance team, there might be various levels of approval required for generating sales invoices (similar to Sales team).

## Modelling

This example showcases how to use [modular models](https://openfga.dev/docs/modeling/modular-models) to organize your model across multiple files. It is adapted from the [official OpenFGA documentation](https://github.com/openfga/sample-stores/blob/main/stores/modular/README.md).

Based on the requirements as stated above, we can model the authorization model as follows:

- A `core` [module](./core.fga) defines the core entity types that are shared across components.
- A `shared` [module](./shared.fga) defines the entity types related to team-based permissions (e.g., folders).
- An `inventory` [module](./inventory.fga) defines the entity types related to the Inventory team.
- A `quotation` [module](./quotation.fga) defines the entity types related to quotations (e.g. cRFQ). Multiple teams (e.g., Sales, Purchase) could use this module.
- An `order` [module](./order.fga) defines the entity types related to orders (e.g. sales orders). Multiple teams (e.g., Sales, Purchase, Repair) could use this module.

An `fga.mod` [manifest file](./fga.mod) declares all the modules for the model.
The model can be written to an OpenFGA store with the `fga model write --file fga.mod --store-id <store_id>` CLI command.

If you then try to get the model with the `fga model get --format fga --store-id <store_id>` command, OpenFGA will display it as a single combined model, with annotations describing the module that define each type.

The example includes a module definition file + a test file per module. You do not need to worry about the YAML linting (for the most part).

## Try It Out

1. Set up a local `.env` file from the `.env.example` file with all the relevant variables.

2. Make sure you have the [FGA CLI](https://github.com/openfga/cli/?tab=readme-ov-file#installation) and have successfully [configured OpenFGA](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga).

Namely, you should run the following commands in the `openfga` directory:

```bash
openfga migrate --datastore-uri "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable" --datastore-engine postgres
openfga run --datastore-uri "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable" --datastore-engine postgres
```

3. In the `openfga` directory: If the OpenFGA model is being initialized, create the OpenFGA store:

```bash
export FGA_STORE_ID=$(fga store create --name "My OpenFGA Model" --model fga.mod --debug | jq -r .store.id)
```

Otherwise, update the authorization model currently loaded:

```bash
fga store list
# {
#   "continuation_token":"",
#   "stores": [
#     {
#       "created_at":"2025-07-18T07:06:34.313704Z",
#       "id":"01K0E5PBE97ERBDABTAVBMGJFS",
#       "name":"My OpenFGA Model",
#       "updated_at":"2025-07-18T07:06:34.313704Z"
#     }
#   ]
# }

# fga model write --store-id $FGA_STORE_ID --file fga.mod
fga model write --store-id 01K0E5PBE97ERBDABTAVBMGJFS --file fga.mod
# {
#   "authorization_model_id":"01K0E7V7F1VG680YKV92H060A7"
# }
```

4. In the `openfga` directory, run the test for each module:

```bash
# fga model test --store-id $FGA_STORE_ID --model-id $FGA_MODEL_ID --tests path/to/test.fga.yaml
fga model test --store-id 01K0E5PBE97ERBDABTAVBMGJFS --model-id 01K0E7V7F1VG680YKV92H060A7 --tests tests/core.fga.yaml
fga model test --store-id 01K0E5PBE97ERBDABTAVBMGJFS --model-id 01K0E7V7F1VG680YKV92H060A7 --tests tests/inventory.fga.yaml
fga model test --store-id 01K0E5PBE97ERBDABTAVBMGJFS --model-id 01K0E7V7F1VG680YKV92H060A7 --tests tests/quotation.fga.yaml
fga model test --store-id 01K0E5PBE97ERBDABTAVBMGJFS --model-id 01K0E7V7F1VG680YKV92H060A7 --tests tests/order.fga.yaml
fga model test --store-id 01K0E5PBE97ERBDABTAVBMGJFS --model-id 01K0E7V7F1VG680YKV92H060A7 --tests tests/invoice.fga.yaml
# Test Summary #
# Tests 10/10 passing
# Checks 100/100 passing
```
