import { Routes } from "@angular/router";

export const categoriesRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./categories-list.component").then(
        (m) => m.CategoriesListComponent,
      ),
  },
];
