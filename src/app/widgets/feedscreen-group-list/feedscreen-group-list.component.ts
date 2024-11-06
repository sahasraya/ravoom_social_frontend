import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-feedscreen-group-list',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './feedscreen-group-list.component.html',
  styleUrl: './feedscreen-group-list.component.css'
})
export class FeedscreenGroupListComponent implements OnInit {

  APIURL = environment.APIURL;
  populargrouplist:any [] = [];
  userid:string="";
  private encryptionPassword: string = 'fhwkehfkjhAJhkKJWHRKWHEjhewpofiepwomvdkAoirep'; 


  constructor(private http:HttpClient,private router:Router){}

  ngOnInit(): void {
    this.checkdataavaibleinsession();
 
      this.userid = localStorage.getItem('wmd') || '';
  
  }

  checkdataavaibleinsession(): void {
    const encryptedData = sessionStorage.getItem('populargroups');
    if (encryptedData) {
      this.loadGroupsFromSessionStorage(encryptedData);
    } else {
      this.getPopularGroups();
    }
  }

  async loadGroupsFromSessionStorage(encryptedData: string): Promise<void> {
    const decryptedData = await this.decryptData(encryptedData, this.encryptionPassword);
    if (decryptedData) {
      this.populargrouplist = JSON.parse(decryptedData); 
    }
  }

  async getPopularGroups(): Promise<void> {
    this.http.post<any[]>(`${this.APIURL}get_populargroup`, new FormData()).subscribe({
      next: (response: any[]) => {
        this.populargrouplist = response;

        this.populargrouplist.forEach((group: any) => {
          if (group.groupimage) {
            group.groupImageUrl = this.createBlobUrl(group.groupimage, 'image/jpeg');
          }
        });

 
        this.storeGroupsInSessionStorage(this.populargrouplist);
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
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
  







  async navigatetogroup(grouptype:any,groupid:any,groupownerid:any,groupname:string):Promise<void>{
 
    if (grouptype === "public") {
      this.router.navigate(['home/group', groupid]);
    } else if (groupownerid == this.userid) {
      this.router.navigate(['home/group', groupid]);
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
