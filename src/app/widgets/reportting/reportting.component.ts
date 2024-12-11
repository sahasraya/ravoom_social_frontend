import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-reportting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportting.component.html',
  styleUrls: ['./reportting.component.css']
})
export class ReporttingComponent implements OnInit {
  @Input() type: string | undefined;
  @Input() selectedreportPostId: string | undefined;
  @Input() selectedrepostpostowneruid: string | undefined;

  reportFormGroup: FormGroup;
  selectedOption: string | undefined;
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
  showSecondPage: boolean = false;
  secondScreenOptioValueSelected: boolean = false;
  reporttype: string = "";

  APIURL = environment.APIURL;

  constructor(private fb: FormBuilder,private http:HttpClient) {
    this.reportFormGroup = this.fb.group({});
  }

  ngOnInit(): void {
    if (this.type === "postreport") {
      this.reporttype = "post";
    } else if (this.type === "comment") {
      this.reporttype = "comment";
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
    this.showSecondPage = true;
  }

  chackradiovalueoption(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.type === 'radio') {
      this.secondScreenOptioValueSelected = true;
      this.selectedOption = inputElement.value;
    }
  }

  async onreportsubmit(): Promise<void> {
    this.showSecondPage = false;
    if (this.selectedOption && this.selectedreportPostId && this.selectedrepostpostowneruid) {

      const formData = new FormData();
      formData.append('selectedOption', this.selectedOption);
      formData.append('selectedreportPostId', this.selectedreportPostId);
      formData.append('selectedrepostpostowneruid', this.selectedrepostpostowneruid);
    
      this.http.post<any>(`${this.APIURL}report_post`, formData).subscribe({
        next: (reponse:any) => {
          if (reponse.message == "Report submitted successfully, email sent.") {
            alert("Your report is submited");
         }
    
    
          
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching link preview:', error);
        }
      });
      
    }
  }

  goback(): void {
    this.showSecondPage = false;
    this.secondScreenOptioValueSelected = false;
  }
}
