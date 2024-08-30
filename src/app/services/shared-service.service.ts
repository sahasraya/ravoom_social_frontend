import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
 

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {

  APIURL = 'http://127.0.0.1:8000/';
 


  constructor(private http: HttpClient, private router: Router) {}
  

  async joinGroup(grouptype: any, groupid: any, username: string, userid: any,curruntuserid:any): Promise<void> {

 
 
   

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    localStorage.setItem('scrollPosition', scrollPosition.toString());

    if(curruntuserid ==''){
     alert("You are not logged in");
    }else if (grouptype === 'public' || userid === curruntuserid) {
      this.router.navigate(['home/group', groupid]);
    } else {
      const formData = new FormData();
      formData.append('groupid', groupid);
      formData.append('groupownerid', userid);
      formData.append('myuserid', curruntuserid);

      try {
        const response = await this.http.post<any>(`${this.APIURL}ask_permission_from_admin_to_join_group`, formData).toPromise();

        if (response.message === 'requestsent') {
          alert(`Wait till the permission`);
        } else if (response.message === 'requestaccepted') {
          this.router.navigate(['home/group', groupid]);
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.error('There was an error!', error);
        alert('There was an error sending the permission request. Please try again later.');
      }
    }
  }
}
