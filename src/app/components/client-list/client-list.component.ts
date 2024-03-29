import { Component } from '@angular/core'

import { faCamera, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ClientModel } from 'src/app/models/client-model'
import { ClientService } from 'src/app/services/client.service'
import { UtilsService } from 'src/app/services/utils.service'

@Component({
  selector: 'app-client',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  standalone: false,
})

export class ClientComponent {
  headerMessage: string = 'Cadastro de Cliente'
  isEditing: boolean = false
  displayedColumns: string[] = ['name', 'age', 'email', 'created_at', 'updated_at', 'action_buttons']
  clientInfos: ClientModel = new ClientModel()
  clientList: ClientModel[] = []
  faCamera = faCamera
  faTrash = faTrash
  faPlus = faPlus
  faPen = faPen
  
  constructor(private clientService: ClientService, private utilService: UtilsService) {}

  ngOnInit(): void {
    this.utilService.toggle(false)
    this.fetchClients()
  }

  fetchClients(): void {
    this.clientService.getClients().subscribe(res => {
      this.clientService.updateClientList(res)
    })

    this.clientService.$clientList.subscribe(res => {
      this.clientList = [ ...res ]
    })
  }

  deleteClient(clientId: string): void {
    const confirm_delete = confirm('Tem certeza que deseja excluir este cliente?')

    if (confirm_delete) {
      this.clientService.deleteClient(clientId).subscribe(() => {
        alert('Cliente excluído com sucesso')

        this.clientService.getClients().subscribe(res => {
          this.clientService.updateClientList(res)
        })
      }, err => {
        alert(err.error.message)
      })
    }
  }
}
