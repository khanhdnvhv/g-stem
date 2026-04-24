# RBAC Permission Matrix — Geleximco STEM Platform

> Nguồn chính xác trong code: `src/app/components/permissions.ts`.
> Ký hiệu: ✅ full | ⚠️ subset | 👁 read-only | — denied.

| Role \ Namespace | /supplier | /distributor | /school | /authority | /teacher | /student | /admin | /shared |
|---|---|---|---|---|---|---|---|---|
| supplier_admin | ✅ | 👁 CRM | 👁 | — | — | — | — | ✅ |
| supplier_content | ⚠️ content + programs | — | — | — | — | — | — | ✅ |
| supplier_sales | ⚠️ orders + schools | 👁 | 👁 | — | — | — | — | ✅ |
| supplier_warranty | ⚠️ warranty + equipment | — | 👁 equipment | — | — | — | — | ✅ |
| distributor_admin | — | ✅ | 👁 customers | — | — | — | — | ✅ |
| distributor_sales | — | ⚠️ orders + CRM | 👁 | — | — | — | — | ✅ |
| distributor_finance | — | ⚠️ revenue + commission | — | — | — | — | — | ✅ |
| school_principal | — | — | ✅ | — | 👁 schedule | 👁 | — | ✅ |
| school_admin | — | — | ⚠️ purchase + equipment + license | — | — | — | — | ✅ |
| school_itadmin | — | — | ⚠️ equipment + license | — | — | — | — | ✅ |
| authority_admin | — | — | 👁 | ✅ | — | — | — | ✅ |
| authority_viewer | — | — | 👁 | ⚠️ read-only | — | — | — | ✅ |
| teacher | — | — | 👁 students | — | ✅ | 👁 | — | ✅ |
| student | — | — | — | — | — | ✅ | — | ✅ |
| system_admin | 👁 | 👁 | 👁 | 👁 | 👁 | 👁 | ✅ | ✅ |

## Mặc định redirect sau login

| Role | Route |
|---|---|
| supplier_* | /supplier/dashboard |
| distributor_* | /distributor/dashboard |
| school_principal, school_admin, school_itadmin | /school/dashboard |
| authority_* | /authority/dashboard |
| teacher | /teacher/dashboard |
| student | /student/dashboard |
| system_admin | /admin/dashboard |

## Helper sử dụng
```ts
import { can } from "@/components/permissions";
if (!can(user, "/supplier")) redirect("/");
```
