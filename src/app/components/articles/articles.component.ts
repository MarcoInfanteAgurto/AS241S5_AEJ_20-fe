import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService, ArticleSummary, ArticleRequest } from '../../services/article.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ArticlesComponent implements OnInit, AfterViewInit {
  articles: ArticleSummary[] = [];
  selectedArticle: ArticleSummary | null = null;

  formData: ArticleRequest = {
    url: '',
    lang: 'es',
    length: 3
  };

  isEditing = false;
  showForm = false;
  loading = false;
  formLoading = false;

  // Confirm modal
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmIcon = '';
  confirmBtnClass = '';
  confirmAction: (() => void) | null = null;

  // Detail modal
  showDetail = false;
  detailArticle: ArticleSummary | null = null;

  constructor(private articleService: ArticleService, private cdr: ChangeDetectorRef) {
    // No cargar datos en el constructor para evitar problemas de ciclo de vida
  }

  ngOnInit(): void {
    console.log('ArticlesComponent ngOnInit called');
    // Usar setTimeout para asegurar que el componente esté completamente inicializado
    setTimeout(() => {
      this.loadArticles();
    }, 0);
  }

  ngAfterViewInit(): void {
    console.log('ArticlesComponent ngAfterViewInit called');
    // No cargar datos aquí para evitar duplicación
  }

  loadArticles(): void {
    console.log('loadArticles called');
    console.log('Current articles length:', this.articles.length);
    console.log('Current loading state:', this.loading);
    
    this.loading = true;
    
    this.articleService.getAll().subscribe({
      next: (data) => {
        console.log('Articles loaded successfully:', data);
        console.log('Raw data length:', data.length);
        
        // Crear un mapa para manejar duplicados por URL
        const articleMap = new Map<string, ArticleSummary>();
        
        // Prioridad de estados: inactive > failed > active > pending
        const statusPriority: { [key: string]: number } = {
          'inactive': 4,
          'failed': 3,
          'active': 2,
          'pending': 1
        };
        
        data.forEach(article => {
          const existing = articleMap.get(article.url);
          
          if (!existing) {
            // Si no existe, agregarlo
            articleMap.set(article.url, article);
          } else {
            // Si existe, comparar prioridades
            const currentPriority = statusPriority[article.status] || 0;
            const existingPriority = statusPriority[existing.status] || 0;
            
            // Mantener el de mayor prioridad, o el más reciente si tienen la misma prioridad
            if (currentPriority > existingPriority || 
                (currentPriority === existingPriority && 
                 new Date(article.createdAt || 0) > new Date(existing.createdAt || 0))) {
              articleMap.set(article.url, article);
            }
          }
        });
        
        // Convertir el mapa a array y ordenar por fecha (más recientes primero)
        const uniqueArticles = Array.from(articleMap.values())
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime(); // Orden descendente (más recientes primero)
          });
        
        console.log('Unique articles after filtering:', uniqueArticles.length);
        console.log('Articles with their status:', uniqueArticles.map(a => ({ 
          id: a.id, 
          url: a.url.substring(0, 50) + '...', 
          status: a.status 
        })));
        
        this.articles = [...uniqueArticles];
        this.loading = false;
        console.log('Loading set to false, articles length now:', this.articles.length);
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.url) return;

    this.formLoading = true;

    this.articleService.create(this.formData).subscribe({
      next: () => {
        this.loadArticles();
        this.resetForm();
        this.formLoading = false;
      },
      error: (err) => {
        console.error('Error creating article:', err);
        this.formLoading = false;
      }
    });
  }

  onSoftDelete(article: ArticleSummary): void {
    console.log('onSoftDelete called for article:', article.id);
    this.confirmTitle = 'Eliminar Artículo';
    this.confirmMessage = `¿Estás seguro de desactivar el artículo de "${article.url}"?`;
    this.confirmIcon = 'fa-solid fa-trash-can';
    this.confirmBtnClass = 'bg-red-600 hover:bg-red-700';
    this.confirmAction = () => {
      console.log('Executing softDelete for article:', article.id);
      this.articleService.softDelete(article.id!).subscribe({
        next: (result) => {
          console.log('SoftDelete successful:', result);
          this.loadArticles();
        },
        error: (err) => {
          console.error('Error deleting article:', err);
        }
      });
    };
    console.log('Setting showConfirm to true');
    this.showConfirm = true;
  }

  onRestore(article: ArticleSummary): void {
    this.confirmTitle = 'Restaurar Artículo';
    this.confirmMessage = `¿Estás seguro de restaurar el artículo de "${article.url}"?`;
    this.confirmIcon = 'fa-solid fa-rotate-left';
    this.confirmBtnClass = 'bg-emerald-600 hover:bg-emerald-700';
    this.confirmAction = () => {
      this.articleService.restore(article.id!).subscribe({
        next: () => this.loadArticles(),
        error: (err) => console.error('Error restoring article:', err)
      });
    };
    this.showConfirm = true;
  }

  onConfirmAccept(): void {
    console.log('onConfirmAccept called');
    console.log('confirmAction exists:', !!this.confirmAction);
    if (this.confirmAction) {
      console.log('Executing confirmAction');
      this.confirmAction();
    } else {
      console.log('No confirmAction to execute');
    }
    this.showConfirm = false;
    this.confirmAction = null;
  }

  onConfirmCancel(): void {
    this.showConfirm = false;
    this.confirmAction = null;
  }

  onViewDetail(article: ArticleSummary): void {
    this.detailArticle = article;
    this.showDetail = true;
  }

  onCloseDetail(): void {
    this.showDetail = false;
    this.detailArticle = null;
  }

  resetForm(): void {
    this.formData = { url: '', lang: 'es', length: 3 };
    this.selectedArticle = null;
    this.isEditing = false;
    this.showForm = false;
    this.formLoading = false;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return status;
    }
  }

  canDelete(article: ArticleSummary): boolean {
    console.log(`Article ${article.id} status: ${article.status}, canDelete: ${article.status === 'active'}`);
    return article.status === 'active';
  }

  canRestore(article: ArticleSummary): boolean {
    console.log(`Article ${article.id} status: ${article.status}, canRestore: ${article.status === 'inactive'}`);
    return article.status === 'inactive';
  }
}
