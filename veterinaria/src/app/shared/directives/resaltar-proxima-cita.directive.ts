import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { AgendaScheduler } from '../../core/classes/agenda-scheduler';
import { Cita } from '../../core/models/cita.model';

@Directive({
  selector: '[appResaltarProximaCita]',
  standalone: false,
})
export class ResaltarProximaCitaDirective implements OnChanges {
  @Input('appResaltarProximaCita') cita: Cita | null = null;

  private readonly scheduler = new AgendaScheduler();

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  ngOnChanges(): void {
    this.resetStyles();

    if (!this.cita) {
      return;
    }

    const debeResaltar =
      (this.cita.estado === 'pendiente' || this.cita.estado === 'confirmada') &&
      this.scheduler.isUpcoming(this.cita.fechaHora, 24);

    if (!debeResaltar) {
      return;
    }

    this.renderer.setStyle(this.elementRef.nativeElement, 'border-left', '4px solid #f97316');
    this.renderer.setStyle(this.elementRef.nativeElement, 'background-color', '#fff7ed');
  }

  private resetStyles(): void {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'border-left');
    this.renderer.removeStyle(this.elementRef.nativeElement, 'background-color');
  }
}
