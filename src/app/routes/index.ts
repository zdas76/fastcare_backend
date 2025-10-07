import express from "express";
import { CategoryRouter } from "../modules/Category/category.route";
import { SubCategoryRouter } from "../modules/SubCategory/subCategory.route";
import { UnitRoute } from "../modules/unit/unit.route";
import { ProductRoute } from "../modules/products/product.route";
import { ChemistRoute } from "../modules/Chemist/chemist.route";
import { PosrRoute } from "../modules/post/post.route";
import { UserRoute } from "../modules/User/user.route";
import { DepoRouter } from "../modules/Depo/depo.route";
import { PartyRouter } from "../modules/party/party.route";
import { LedgerHeadRoute } from "../modules/LedgerHead/LedgerHead.route";
import { AccountHeadRoute } from "../modules/accountHead/head.route";
import { JournalRoute } from "../modules/journal/journal.route";
import { InventoryRoute } from "../modules/inventories/inventories.route";
import { DegreeRouter } from "../modules/Degree/degree.route";
import { StakeholderRoute } from "../modules/Stakeholder/stakeholder.route";
import { DesignationRouter } from "../modules/Designation/designation.route";
import { AuthRoutes } from "../modules/Auth/auth.router";
import { scopeRoute } from "../modules/Scope/scope.route";
import { OrderRouter } from "../modules/Order/ordet.route";
import { ReportRouter } from "../modules/report/report.route";

const router = express.Router();

const moduleroutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/category",
    route: CategoryRouter,
  },
  {
    path: "/sub-category",
    route: SubCategoryRouter,
  },
  {
    path: "/unit",
    route: UnitRoute,
  },
  {
    path: "/product",
    route: ProductRoute,
  },
  {
    path: "/chemist",
    route: ChemistRoute,
  },
  {
    path: "/post",
    route: PosrRoute,
  },
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/depo",
    route: DepoRouter,
  },
  {
    path: "/party",
    route: PartyRouter,
  },
  {
    path: "/ledger_head",
    route: LedgerHeadRoute,
  },
  {
    path: "/account_head",
    route: AccountHeadRoute,
  },
  {
    path: "/journal",
    route: JournalRoute,
  },
  {
    path: "/inventory",
    route: InventoryRoute,
  },
  {
    path: "/degree",
    route: DegreeRouter,
  },
  {
    path: "/designation",
    route: DesignationRouter,
  },
  {
    path: "/stakeholder",
    route: StakeholderRoute,
  },
  {
    path: "/scope",
    route: scopeRoute,
  },
  {
    path: "/order",
    route: OrderRouter,
  },
  {
    path: "/report",
    route: ReportRouter,
  },
];

moduleroutes.forEach((route) => router.use(route.path, route.route));

export default router;
