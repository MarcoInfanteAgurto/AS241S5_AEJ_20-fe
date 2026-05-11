import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService, ImageRecord, ImageRequest } from '../../services/image.service';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ImagesComponent implements OnInit, AfterViewInit {
  images: ImageRecord[] = [];
  selectedImage: ImageRecord | null = null;

  formData: ImageRequest = {
    prompt: '',
    styleId: 4,
    size: '1-1'
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
  detailImage: ImageRecord | null = null;

  constructor(private imageService: ImageService, private cdr: ChangeDetectorRef) {
    // No cargar datos en el constructor para evitar problemas de ciclo de vida
  }

  ngOnInit(): void {
    console.log('ImagesComponent ngOnInit called');
    // Usar setTimeout para asegurar que el componente esté completamente inicializado
    setTimeout(() => {
      this.loadImages();
    }, 0);
  }

  ngAfterViewInit(): void {
    console.log('ImagesComponent ngAfterViewInit called');
    // No cargar datos aquí para evitar duplicación
  }

  loadImages(): void {
    console.log('loadImages called');
    console.log('Current images length:', this.images.length);
    console.log('Current loading state:', this.loading);
    
    this.loading = true;
    
    this.imageService.getAll().subscribe({
      next: (data) => {
        console.log('Images loaded successfully:', data);
        console.log('Setting images array with length:', data.length);
        
        // Ordenar por fecha de creación (más recientes primero)
        const sortedImages = [...data]
          .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime(); // Orden descendente
        });
        
        this.images = sortedImages;
        this.loading = false;
        console.log('Loading set to false, images length now:', this.images.length);
        
        // Forzar detección de cambios de manera segura
        setTimeout(() => {
          this.cdr.markForCheck();
        }, 0);
      },
      error: (err) => {
        console.error('Error loading images:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.prompt) return;

    this.formLoading = true;

    this.imageService.create(this.formData).subscribe({
      next: () => {
        this.loadImages();
        this.resetForm();
        this.formLoading = false;
      },
      error: (err) => {
        console.error('Error creating image:', err);
        this.formLoading = false;
      }
    });
  }

  onConfirmAccept(): void {
    this.confirmAction?.();
    this.showConfirm = false;
    this.confirmAction = null;
  }

  onConfirmCancel(): void {
    this.showConfirm = false;
    this.confirmAction = null;
  }

  onViewDetail(image: ImageRecord): void {
    this.detailImage = image;
    this.showDetail = true;
  }

  onImageError(image: ImageRecord): void {
    image.imageUrl = undefined;
  }

  onCloseDetail(): void {
    this.showDetail = false;
    this.detailImage = null;
  }

  getSafeImageUrl(imageUrl?: string): string | null {
    return imageUrl ?? null;
  }

  resetForm(): void {
    this.formData = { prompt: '', styleId: 4, size: '1-1' };
    this.selectedImage = null;
    this.isEditing = false;
    this.showForm = false;
    this.formLoading = false;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'generated': return 'Generado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return status;
    }
  }
}



