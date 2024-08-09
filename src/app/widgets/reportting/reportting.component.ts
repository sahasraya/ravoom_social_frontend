import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reportting',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './reportting.component.html',
  styleUrl: './reportting.component.css'
})
export class ReporttingComponent implements OnInit{
  @Input() type: string | undefined;

  reportFormGroup: FormGroup;
  showNudityBool: boolean = false; 
  showBullyingBool: boolean = false;
  showSelfInjuryBool: boolean = false;
  showViolenceBool: boolean = false;
  showRestrictedItemsBool: boolean = false;
  showScamBool: boolean = false;
  showSpamBool: boolean = false;
  showFalseInfoBool: boolean = false;
  showIntellectualPropertyBool: boolean = false;
  showNotSeeBool: boolean = false;
  showSecondPage:boolean=false;
  secondScreenOptioValueSelected:boolean =false;
  reporttype:string="";

  constructor(private fb: FormBuilder) {
    this.reportFormGroup = this.fb.group({
        
    });
  }
  ngOnInit(): void {
   if(this.type =="postreport"){
     this.reporttype="post";
   }
  }

  chackradiovalue(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.type === 'radio') {
      this.resetAllFlags();
      switch (inputElement.value) {
        case 'nudity':
          this.showNudityBool = true;
          break;
        case 'bullying':
          this.showBullyingBool = true;
          break;
        case 'self-injury':
          this.showSelfInjuryBool = true;
          break;
        case 'violence':
          this.showViolenceBool = true;
          break;
        case 'restricted-items':
          this.showRestrictedItemsBool = true;
          break;
        case 'scam':
          this.showScamBool = true;
          break;
        case 'spam':
          this.showSpamBool = true;
          break;
        case 'false-info':
          this.showFalseInfoBool = true;
          break;
        case 'intellectual-property':
          this.showIntellectualPropertyBool = true;
          break;
        case 'not-see':
          this.showNotSeeBool = true;
          break;
      }
    }
  }

  resetAllFlags(): void {
    this.showNudityBool = false;
    this.showBullyingBool = false;
    this.showSelfInjuryBool = false;
    this.showViolenceBool = false;
    this.showRestrictedItemsBool = false;
    this.showScamBool = false;
    this.showSpamBool = false;
    this.showFalseInfoBool = false;
    this.showIntellectualPropertyBool = false;
    this.showNotSeeBool = false;
    this.showSecondPage=true;
  }

  chackradiovalueoption(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.type === 'radio') {
   
      this.secondScreenOptioValueSelected= true;
      // alert(`Selected additional option: ${inputElement.value}`);
    }
  }

  async onreportsubmit(): Promise<void> {
    this.showSecondPage=false;
  }


  goback():void{
    this.showSecondPage=false;
    this.secondScreenOptioValueSelected= false;

  }
}
