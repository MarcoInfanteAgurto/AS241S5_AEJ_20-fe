import { Routes } from '@angular/router';
import { ArticlesComponent } from './components/articles/articles.component';
import { ImagesComponent } from './components/images/images.component';

export const routes: Routes = [
  { path: '', redirectTo: '/articles', pathMatch: 'full' },
  { path: 'articles', component: ArticlesComponent },
  { path: 'images', component: ImagesComponent }
];
