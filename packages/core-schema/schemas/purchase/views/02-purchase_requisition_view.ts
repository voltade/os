// import { eq, sql } from 'drizzle-orm';
// import { pgView } from 'drizzle-orm/pg-core';

// import { userTable } from '../../resource/tables/user.ts';
// import { purchaseRequisitionTable } from '../tables/purchase_requisition.ts';

// export const purchaseRequisitionView = pgView('purchase_requisition_view').as(
//   (qb) => {
//     return qb
//       .select({
//         id: purchaseRequisitionTable.id,
//         reference_id: purchaseRequisitionTable.reference_id,
//         title: purchaseRequisitionTable.title,
//         description: purchaseRequisitionTable.description,
//         priority: purchaseRequisitionTable.priority,

//         // This will be null when no permission - handled in app layer
//         total_expected_cost: sql<string | null>`
//         CASE
//           WHEN user_has_permission('view_all') THEN ${purchaseRequisitionTable.total_expected_cost}
//           ELSE NULL
//         END
//       `.as('total_expected_cost'),

//         rfq_valid_until: purchaseRequisitionTable.rfq_valid_until,
//         status: purchaseRequisitionTable.status,
//         created_by: sql<string>`
//         CONCAT(created_user.first_name, ' ', created_user.last_name)
//       `.as('created_by_name'),
//         created_at: purchaseRequisitionTable.created_at,
//       })
//       .from(purchaseRequisitionTable)
//       .leftJoin(
//         userTable,
//         eq(userTable.id, purchaseRequisitionTable.created_by),
//       );
//   },
// );
