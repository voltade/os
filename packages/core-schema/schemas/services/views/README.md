Views are prefixed with 01.. to ensure `bun dk push` executes in proper order.

This is to avoid issues for when views depend on another and require the
depended view to be created already.
