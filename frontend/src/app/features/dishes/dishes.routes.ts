import { Routes } from "@angular/router";

export const dishesRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./dishes-list.component").then((m) => m.DishesListComponent),
  },
];
