import { Component } from '@angular/core'
import { FormGroup, FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

import { BarcodeFormat } from '@zxing/library'

import { ItemModel } from 'src/app/models/item-model'
import { faArrowLeft, faCamera } from '@fortawesome/free-solid-svg-icons'
import { ConvertImageService } from 'src/app/services/convert-image.service'
import { ItemsService } from 'src/app/services/items.service'
import { UtilsService } from 'src/app/services/utils.service'
import { CategoryModel } from 'src/app/models/category-model'
import { NavigationService } from 'src/app/services/navigation.service'

@Component({
  selector: 'app-register-item',
  templateUrl: './register-item.component.html',
  styleUrls: ['./register-item.component.scss'],
  standalone: false,
})
export class RegisterItemComponent {
  itemGroup: FormGroup = new FormGroup({})
  itemCategories: CategoryModel[] = []
  returnRoute!: string
  selectedImage!: any
  selectedFile!: File
  isChangingImage: boolean = false
  isScanning: boolean = false
  item_id!: string
  item_barcode!: string
  itemInfo!: ItemModel
  save_button: string = 'Cadastrar'
  header: string = 'Novo Produto'
  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_EAN_EXTENSION,
    BarcodeFormat.UPC_E,
  ]
  faCamera = faCamera
  faArrowLeft = faArrowLeft

  constructor(
    private formBuilder: FormBuilder,
    private itemsService: ItemsService,
    private activatedRoute: ActivatedRoute,
    private imageConverter: ConvertImageService,
    private utilService: UtilsService,
    private router: Router,
    private navigationService: NavigationService
  ) {}
  
  ngOnInit(): void {
    this.returnRoute = this.navigationService.getPreviousRoute()
    this.utilService.toggle(false)
    this.createForm(new ItemModel)
    this.fetchCategories()

    this.activatedRoute.params.subscribe(param => {
      this.item_id = param['id']
      this.item_barcode = param['barcode']
    })

    if (this.item_id) {
      this.save_button = 'Salvar'
      this.header = 'Editar Produto'

      this.populateForm()
    } else if (this.item_barcode) {
      this.itemGroup.patchValue({
        barcode: this.item_barcode,
      })
    }
  }

  createForm(itemModel: ItemModel): void {
    this.itemGroup = this.formBuilder.group({
      name: [itemModel.name],
      unit_price: [itemModel.unit_price],
      sale_price: [itemModel.sale_price],
      barcode: [itemModel.barcode],
      category: [itemModel.category],
      product_image: [itemModel.product_image],
    })
  }
  
  populateForm(): void {
    this.itemsService.getItem(this.item_id).subscribe(res => {
      this.itemInfo = res
      this.itemGroup.patchValue({
        name: res.name,
        quantity: res.quantity,
        unit_price: res.unit_price,
        sale_price: res.sale_price,
        barcode: res.barcode,
        category: res.category,
      })
      this.selectedImage = res.product_image
      const image = new File([res.product_image], `product_image.jpg`, { type: 'image/jpeg' })
      this.selectedFile = image
    })
  }

  onCodeResult(barcode: string): void {
    this.itemGroup.patchValue({
      barcode: barcode,
    })

    this.isScanning = false
  }

  async onSubmit() {
    const ITEM: ItemModel = { ...this.itemGroup.value }

    ITEM.product_image = this.isChangingImage
      ? await this.imageConverter.convertToBase64(this.selectedFile)
      : this.itemInfo.product_image

    if (this.item_id) {
      this.updateItem(ITEM)
    } else {
      this.registerItem(ITEM)
    }
  }
  
  registerItem(itemModel: ItemModel): void {
    this.itemsService.registerItem(itemModel).subscribe(() => {
      this.excludeImage()
      this.createForm(new ItemModel())
      alert('Produto registrado com sucesso!')
    }, err => {
      alert(err.error.message)
    })
  }
  
  updateItem(itemModel: ItemModel): void {
    this.itemsService.updateItem(itemModel, this.item_id).subscribe(() => {
      alert('Produto atualizado com sucesso!')
    }, err => {
      alert(err.error.message)
    })
  }

  fetchCategories(): void {
    this.utilService.fetchCategories().subscribe(categories => {
      this.itemCategories = categories
    }, err => {
      console.error(err)
    })
  }

  excludeImage(): void {
    this.selectedImage = null
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        this.selectedFile = file
        this.selectedImage = reader.result
        this.isChangingImage = true
      }
    }
  }

  return(): void {
    this.router.navigate([this.returnRoute])
  }
}
