import { TokenInterceptor } from './shared/interceptors/token.interceptor';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';

import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { routes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { ADMIN_API_BASE_URL } from 'src/app/api/admin-api.service.generated';
import { environment } from 'src/enviroments/environment';
import { AlertService } from 'src/app/shared/services/alert.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withHashLocation()
    ),
    importProvidersFrom(SidebarModule, DropdownModule),
    IconSetService,
    provideAnimations(),
    provideHttpClient(
      withInterceptors([TokenInterceptor]),
    ),

    // Shared service
    MessageService,
    AlertService,
    AuthGuard,
    ConfirmationService,
    { provide: ADMIN_API_BASE_URL, useValue: environment.API_URL },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenInterceptor,
    //   multi: true
    // },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: GlobalHttpInterceptorService,
    //   multi: true
    // },
  ]
};
