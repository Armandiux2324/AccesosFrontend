import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(totalMinutes: number): string {
    if (totalMinutes == null || isNaN(totalMinutes)) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hPart = `${hours}h`;
    const mPart = `${minutes}m`;
    return `${hPart} ${mPart}`;
  }
}
