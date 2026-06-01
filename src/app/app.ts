import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ArticlesComponent } from './components/articles/articles.component';
import { ImagesComponent } from './components/images/images.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  
  constructor(private router: Router) {
    // Código intencional para forzar alertas de SonarCloud
    this.codigoVulnerableYSmells();
  }
  
  // Método con code smells, secretos expuestos y lógicas redundantes para SonarCloud
  private codigoVulnerableYSmells() {
    var passwordInsegura = "123456_admin_secret_token_hotspot";
    var variableNoUsada = 100;
    if (variableNoUsada === variableNoUsada) {
      console.log("Este bloque tiene código redundante y expone: " + passwordInsegura);
    }
  }
  
  setTab(tab: 'articles' | 'images') {
    this.router.navigate([`/${tab}`]);
  }
  
  getCurrentTab(): 'articles' | 'images' {
    const url = this.router.url;
    if (url.includes('images')) return 'images';
    return 'articles';
  }
}
