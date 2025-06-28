import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(totalMinutes: number): string {
    if (totalMinutes == null || isNaN(totalMinutes)) return '';
    const hours   = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hPart   = hours   ? `${hours}h`           : '';
    const mPart   = minutes ? ` ${minutes}m`         : '';
    return `${hPart}${mPart}`.trim() || '0m';
  }
}
