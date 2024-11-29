import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { useridexported } from '../../auth/const/const';
import { SkeletonWidgetPopularGroupsAndUsersComponent } from '../skeleton-widget-popular-groups-and-users/skeleton-widget-popular-groups-and-users.component';
import { GroupsComponent } from '../../home/groups/groups.component';
import { PopularGroupStateService } from '../../services/popular-groups.service';

@Component({
  selector: 'app-feedscreen-group-list',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule,SkeletonWidgetPopularGroupsAndUsersComponent,GroupsComponent],
  templateUrl: './feedscreen-group-list.component.html',
  styleUrl: './feedscreen-group-list.component.css'
})
export class FeedscreenGroupListComponent implements OnInit {

  APIURL = environment.APIURL;
  populargrouplist:any [] = [];
  userid: string = "";
  isloaidnggroups: boolean = false;
  selectedGroupId: string = "";

  private encryptionPassword: string = 'fhwkehfkjhAJhkKJWHRKWHEjhewpofiepwomvdkAoirep'; 


  constructor(private popularGroupStateService:PopularGroupStateService,private http:HttpClient,private router:Router){}

  ngOnInit(): void {
    const cachedData = this.popularGroupStateService.getState('popularegroups');
    if (cachedData) {
       
      this.populargrouplist = cachedData;
      this.processpopulargroupsDetails();
    } else {
      

      this.getPopularGroups();
    }
    
      this.userid = useridexported;
  
  }
  processpopulargroupsDetails(): void {
    this.populargrouplist.forEach((group) => {
      if (group.groupimage && !group.groupImageUrl) {
        group.groupImageUrl = this.createBlobUrl(group.groupimage, 'image/jpeg');
      }
    });
  }



  async getPopularGroups(): Promise<void> {
    if (this.isloaidnggroups) return;

    this.isloaidnggroups = true;

    this.http.post<any[]>(`${this.APIURL}get_populargroup`, new FormData()).subscribe({
      next: (response: any[]) => {
        this.isloaidnggroups = false;
        this.populargrouplist = response;

        this.populargrouplist.forEach((group: any) => {
          if (group.groupimage) {
            group.groupImageUrl = this.createBlobUrl(group.groupimage, 'image/jpeg');
          }
        });
        this.popularGroupStateService.saveState('popularegroups', this.populargrouplist);

      },
      error: (error: HttpErrorResponse) => {
        this.isloaidnggroups = false;
        console.error('There was an error!', error);
      }
    });
  }



  closeselectedgroup(): void{
    document.body.style.overflow = ''; 
    this.selectedGroupId = "";
  }

  async navigatetogroup(grouptype:any,groupid:any,groupownerid:any,groupname:string):Promise<void>{
    document.body.style.overflow = 'hidden';
    if (grouptype === "public") {
      // this.router.navigate(['home/group', groupid]);
      this.selectedGroupId = groupid; 
    } else if (groupownerid == this.userid) {
      // this.router.navigate(['home/group', groupid]);
      this.selectedGroupId = groupid; 
    } else {



      const formData = new FormData();
      formData.append('groupid', groupid);
      formData.append('groupownerid', groupownerid);
      formData.append('myuserid', this.userid);

      try {
        const response = await this.http.post<any>(`${this.APIURL}ask_permission_from_admin_to_join_group`, formData).toPromise();

        if (response.message === "requestsent") {
          alert("Wait till the permission from " + groupname);
        } else if (response.message === "requestaccepted") {
          this.selectedGroupId = groupid; 
          // this.router.navigate(['home/group', groupid]);
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.error('There was an error!', error);
        alert('There was an error sending the permission request. Please try again later.');
      }

    }
    
  }









  async storeGroupsInSessionStorage(groups: any[]): Promise<void> {
    const encryptedData = await this.encryptData(JSON.stringify(groups), this.encryptionPassword);
    sessionStorage.setItem('populargroups', encryptedData);
  }

 
  private async encryptData(data: string, password: string): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(password),
        iterations: 1000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      enc.encode(data)
    );

    const buffer = new Uint8Array(encryptedData);
    const encryptedDataWithIv = new Uint8Array(iv.length + buffer.length);
    encryptedDataWithIv.set(iv);
    encryptedDataWithIv.set(buffer, iv.length);

    return btoa(String.fromCharCode(...encryptedDataWithIv)); 
  }

 
  private async decryptData(encryptedData: string, password: string): Promise<string | null> {
    const enc = new TextEncoder();
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encryptedBuffer = data.slice(12);

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(password),
        iterations: 1000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    try {
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encryptedBuffer
      );

      return new TextDecoder().decode(decryptedData);
    } catch (e) {
      console.error('Decryption failed:', e);
      return null;
    }
  }
  







  
 



 


  base64ToBlob(base64: string, contentType: string = ''): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }
  
  createBlobUrl(base64: string, contentType: string): string {
    const blob = this.base64ToBlob(base64, contentType);
    return URL.createObjectURL(blob);
  }






}
