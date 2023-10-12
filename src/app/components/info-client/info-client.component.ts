import { Component, OnInit } from '@angular/core'
import { faUser } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-info-client',
  templateUrl: './info-client.component.html',
  styleUrls: ['./info-client.component.scss'],
})
export class InfoClientComponent implements OnInit {
  faUser = faUser

  constructor() {}

  ngOnInit(): void {
  }
}
