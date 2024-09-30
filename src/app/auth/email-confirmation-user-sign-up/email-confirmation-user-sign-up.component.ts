import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-email-confirmation-user-sign-up',
  standalone: true,
  imports: [],
  templateUrl: './email-confirmation-user-sign-up.component.html',
  styleUrl: './email-confirmation-user-sign-up.component.css'
})
export class EmailConfirmationUserSignUpComponent  implements OnInit{

 
  userid:string ="" ;
  APIURL = environment.APIURL;
  
  constructor(private route:ActivatedRoute,private http:HttpClient,private router:Router){}

  ngOnInit(): void {
    this.userid = this.route.snapshot.paramMap.get('uid')!;

    this.confirmemailvalidation(this.userid);
  }

  async confirmemailvalidation(userid: any): Promise<void> {
    if (this.userid) {
      const formData = new FormData();
      formData.append('userid', this.userid);

      this.http.post(this.APIURL + 'update-email-confirmation', formData).subscribe({
        next: response => {
     

          localStorage.setItem('ppd', 'no');
            localStorage.setItem('name', 'normal');
            localStorage.setItem('core', 'never');
            localStorage.setItem('appd', 'AkfwpkfpMMkwppge');
            localStorage.setItem('ud', 'AASfeeg2332Afwfafwa');
            localStorage.setItem('s', '2');
            localStorage.setItem('g', '34');
            localStorage.setItem('21', '5g2');
            localStorage.setItem('cap', 'np');
            localStorage.setItem('uid', 'Jfwgw2wfAfwawwgAd');
            localStorage.setItem('doc', '25');

            localStorage.setItem('wmd', this.userid);

            localStorage.setItem('ger', this.userid);
            localStorage.setItem('fat', this.userid);
            localStorage.setItem('mainsource', this.userid);
            localStorage.setItem('ud', this.userid);

            localStorage.setItem('www', '34');
            localStorage.setItem('reload', 'false');

            

             




        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }
  }

  gohome():void{
    this.router.navigate(['']).then(() => {
      location.reload();
    });
  }
}
