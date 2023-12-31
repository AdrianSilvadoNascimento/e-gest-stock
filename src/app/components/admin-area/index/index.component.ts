import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  constructor(private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.utilsService.hideMenuButton(false)
  }
}
