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
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { TokenInterceptor } from './shared/interceptors/token.interceptor';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ADMIN_API_BASE_URL } from 'src/app/api/admin-api.service.generated';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { LoggedGuard } from 'src/app/shared/guards/logged.guard';
import { AlertService } from 'src/app/shared/services/alert.service';
import { environment } from 'src/enviroments/environment';
import { routes } from './app.routes';

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
      withInterceptors([TokenInterceptor, ErrorInterceptor]),
    ),

    // Shared service
    MessageService,
    AlertService,
    AuthGuard,
    LoggedGuard,
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
