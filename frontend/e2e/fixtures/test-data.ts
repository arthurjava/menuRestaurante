export const testCredentials = {
  admin: {
    email: 'admin@admin.com',
    password: 'adminadmin'
  }
};

export const testUrls = {
  login: '/auth/login',
  menu: '/menu',
  dashboard: '/dashboard',
  categories: '/categories',
  dishes: '/dishes',
  settings: '/settings',
  users: '/users'
};

export const selectors = {
  login: {
    emailInput: 'app-input[formcontrolname="email"] input',
    passwordInput: 'app-input[formcontrolname="password"] input',
    rememberMeCheckbox: 'input[formcontrolname="rememberMe"]',
    submitButton: 'button[type="submit"]',
    registerLink: 'a[routerlink="/auth/register"]',
    forgotPasswordLink: 'a[routerlink="/auth/forgot-password"]'
  },
  menu: {
    header: 'header',
    restaurantName: 'h1',
    searchInput: 'input[placeholder="Buscar pratos..."]',
    categoryFilterButton: 'button:has-text("Categorias")',
    categoryChips: '.chip',
    dishCards: '.dish-card',
    dishImage: '.dish-card img',
    photoLibraryIcon: 'button[aria-label*="todas as imagens"]',
    addToOrderButton: 'button:has-text("Adicionar")',
    emptyState: 'text=Nenhum prato encontrado',
    footer: 'footer'
  },
  modals: {
    imageGallery: 'app-image-gallery',
    galleryCloseButton: 'button:has-text("Fechar")',
    galleryImages: 'app-image-gallery img',
    dishDetailModal: 'app-modal',
    dishDetailImage: 'app-modal img',
    dishDetailPrice: 'text=R$',
    dishDetailAddButton: 'button:has-text("Adicionar ao Pedido")',
    dishDetailImagesButton: 'button:has-text("Ver Imagens")'
  },
  admin: {
    categories: {
      pageTitle: 'h1:has-text("Categorias")',
      createButton: 'button:has-text("Nova Categoria")',
      editButton: 'button[aria-label*="Editar"]',
      deleteButton: 'button[aria-label*="Excluir"]',
      reorderButton: 'button:has-text("Reordenar")',
      nameInput: 'input[formcontrolname="name"]',
      displayOrderInput: 'input[formcontrolname="displayOrder"]',
      imageUrlInput: 'input[formcontrolname="imageUrl"]',
      saveButton: 'button:has-text("Salvar")',
      cancelButton: 'button:has-text("Cancelar")',
      confirmDeleteButton: 'button:has-text("Confirmar")',
      modalTitle: 'app-modal'
    },
    dishes: {
      pageTitle: 'h1:has-text("Pratos")',
      createButton: 'button:has-text("Novo Prato")',
      editButton: 'button[aria-label*="Editar"]',
      deleteButton: 'button[aria-label*="Excluir"]',
      reorderButton: 'button:has-text("Reordenar")',
      nameInput: 'input[formcontrolname="name"]',
      descriptionInput: 'textarea[formcontrolname="description"]',
      priceInput: 'input[formcontrolname="price"]',
      categorySelect: 'mat-select[formcontrolname="categoryId"]',
      activeCheckbox: 'input[formcontrolname="active"]',
      imageUpload: 'app-image-upload',
      saveButton: 'button:has-text("Salvar")',
      cancelButton: 'button:has-text("Cancelar")',
      confirmDeleteButton: 'button:has-text("Confirmar")'
    }
  }
};