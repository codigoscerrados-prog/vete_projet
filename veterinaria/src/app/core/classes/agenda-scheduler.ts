export class AgendaScheduler {
  constructor(
    private readonly startHour = 9,
    private readonly endHour = 17,
  ) {}

  buildHourlySlots(): string[] {
    const slots: string[] = [];
    for (let hour = this.startHour; hour <= this.endHour; hour += 1) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  buildDateTime(fecha: string, hora: string): string {
    return `${fecha}T${hora}`;
  }

  formatAsDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  buildNextDays(days: number): string[] {
    return Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return this.formatAsDateOnly(date);
    });
  }

  isUpcoming(fechaHora: string, maxHoursAhead = 48): boolean {
    const appointmentDate = new Date(fechaHora);
    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    const maxWindowMs = maxHoursAhead * 60 * 60 * 1000;
    return diffMs >= 0 && diffMs <= maxWindowMs;
  }
}
