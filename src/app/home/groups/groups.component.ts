import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AddPostGroupComponent } from '../../widgets/add-post-group/add-post-group.component';
import { PostComponent } from '../../widgets/post/post.component';
import { PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { warn } from 'node:console';
import { ImageLargerComponent } from '../../widgets/image-larger/image-larger.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule,AddPostGroupComponent,PostComponent,FormsModule,ImageLargerComponent,RouterModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{

  groupid:string="";
  APIURL = environment.APIURL;
  group: any;
  userList:any[] =[];
  curruntuserisFollowedList:any[] =[];
  serachAllUsersList:any[] =[];
  userRequests:any[] =[];
  groupimage:string = "";
  groupbackgroundimage:string ="";
  showaddpostgroup:boolean =false;
  showhomeBool:boolean= true;
  showfollowersBool:boolean=false;
  showrequestsBool:boolean=false;
  showsettingsBool:boolean=false;
  showadduserBool:boolean=false;
  isstarttoseachrallusers:boolean=false;
  BGimagechanched:boolean=false;
  maingroupimageischanched:boolean=false;
  showLargerImage: boolean = false;
  isuserjoinggroup: boolean = false;
  showSmallergroupLargerImage: boolean = false;
  limit = 5;
  offset = 0;
  loading = false;
  groupposts: any[] = [];
  userid:string="";
  btntext:string="Join now";
  followerscount:any; 
  currunusertype:string = "";
  selecteduserList: any[] = [];
  grouptype:string = "";
  groupname:string = "";
  groupownerid:string = "";
  groupbackgroundimageupdateddate:string="";
  groupimageupdateddate:string="";




  constructor(private route: ActivatedRoute, private http: HttpClient,private cdr: ChangeDetectorRef,@Inject(PLATFORM_ID) private platformId: Object,private router:Router) {}

  ngOnInit(): void {
    this.groupid = this.route.snapshot.paramMap.get('groupid')!;
    this.getGroupDetails(this.groupid);
    this.getPostsFeed();


    if (isPlatformBrowser(this.platformId)) {
 
      this.userid = localStorage.getItem('wmd') || '';
 
    }
    
 
    this.getnumberofgroupfollowers(this.groupid);
   
    if (this.userid != '') {
      this.joinedornottothegroup(this.userid,this.groupid);
      this.getCurrunUserDetailsOfGroup(this.userid);
      this.getcurruntuserisfolloweduserlidt(this.userid);
    }
 
   
  }



    async getGroupDetails(groupid: string): Promise<void> {
    const formData = new FormData();
    formData.append('groupid', groupid);

    try {
        const response = await this.http.post<any>(`${this.APIURL}get_group_details`, formData).toPromise();
        this.group = response;

        this.grouptype= this.group.grouptype;
        this.groupname = this.group.groupname;
        this.groupownerid = this.group.groupownerid;
        this.groupbackgroundimageupdateddate = this.group.groupbackgroundimageupdateddate;
        this.groupimageupdateddate = this.group.groupimageupdateddate;
      

       
        if (this.group.groupimage) {
            this.groupimage = this.createBlobUrl(this.group.groupimage, 'image/jpeg');
        }
        if (this.group.groupbackgroundimage) {
            this.groupbackgroundimage = this.createBlobUrl(this.group.groupbackgroundimage, 'image/jpeg');
        }

       
        this.userList = [];
        this.userRequests = [];

       
        this.group.users.forEach((user: any) => {
            if (user.profileimage) {
                user.profileimageBlobUrl = this.createBlobUrl(user.profileimage, 'image/jpeg');
            } else {
                user.profileimageBlobUrl = null;
            }

            if (user.status === 0) {
              
                this.userRequests.push(user);
            } else {
 

                this.userList.push(user);
            }
        });

    } catch (error) {
        console.error('There was an error!', error);
    }
}
  onImageClick(): void {
    this.showLargerImage = true;
  }

  onSmallGroupImageImageClick(): void {
    this.showSmallergroupLargerImage = true;
  }

  
   
  onCloseLargerImage(): void {
    this.showLargerImage = false;
  }

  onCloseSmallergroupimageLargerImage(): void {
    this.showSmallergroupLargerImage = false;
  }


  onBackgroundImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.BGimagechanched = true;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.groupbackgroundimage = reader.result as string;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('groupid', this.groupid);
      formData.append('backgroundimage', file);
  
      this.http.post<any>(this.APIURL + 'update-backgroundimage', formData).subscribe({
        next: (response: any) => {
           
          if (response.message === "done") {
            alert("Background image updated successfully!");
            this.getGroupDetails(this.groupid);
          }
        },
        error: error => {
          console.error('There was an error posting the data!', error);
        }
      });



    }
  }


 
  
  onGroupImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    this.maingroupimageischanched = true;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.groupimage = reader.result as string;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('groupid', this.groupid);
      formData.append('groupmainimage', file);
  
      this.http.post<any>(this.APIURL + 'update-groupmainimage', formData).subscribe({
        next: (response: any) => {
          
          if (response.message === "done") {
            alert("Group image updated successfully!");
            this.getGroupDetails(this.groupid);
          }
        },
        error: error => {
          console.error('There was an error posting the data!', error);
        }
      });

    }
  }


  async updateGroupInformation(groupid: any, groupname: string): Promise<void> {
    const formData = new FormData();
    formData.append('groupid', groupid);
    formData.append('groupname', groupname);
  
    this.http.post<any>(this.APIURL + 'update-groupinformation', formData).subscribe({
      next: (response: any) => {
        if (response.message === "done") {
          alert("Group information updated successfully!");
  
        }
      },
      error: error => {
        console.error('There was an error posting the data!', error);
      }
    });
  }


  updatethegroupname(previousgroupname:string ,groupname:string):void  {
 this.groupname =  groupname;
  }








  selectUser(user: any): void {

 
 
    const userIndex = this.selecteduserList.findIndex(selected => selected.username === user.username);

    if (userIndex === -1 && this.selecteduserList.length < 5) {
    
      this.selecteduserList.push(user);
    } else if (userIndex > -1) {
 
      this.selecteduserList.splice(userIndex, 1);
    }
  }

 

  async removegroup(groupid: any): Promise<void> {
    const confirmation = confirm("Do you need to remove this group?");
    
    if (confirmation) {
      const formData = new FormData();
      formData.append('groupid', groupid);

      this.http.post<any>(this.APIURL + 'remove-group', formData).subscribe({
        next: response => {
          if (response.message === "removed") {
            this.router.navigate(['/']);
          }
        },
        error: error => {
          console.error('There was an error posting the data!', error);
        }
      });
    }
  }







  async addFollowedUsersIntoGroup(): Promise<void> {
    if (this.selecteduserList.length === 0) {
      alert('No users selected');
      return;
    }
    try {
      console.log(this.selecteduserList);
      for (const user of this.selecteduserList) {
 
        
        const formData = new FormData();
        formData.append('groupid', this.groupid);
        formData.append('userid', user.otheruserid);  
        formData.append('usertype', user.usertype); 
  
     
        const response = await this.http.post<any>(`${this.APIURL}add_iamfollowed_users_into_group`, formData).toPromise();
        console.log('Add User Response:', response);
      }
  
      this.getnumberofgroupfollowers(this.groupid);
      this.getGroupDetails(this.groupid);
      this.getcurruntuserisfolloweduserlidt(this.userid);
      this.selecteduserList = [];
      this.cdr.detectChanges();
  
    } catch (error) {
      console.error('Error adding users to the group!', error);
      alert('Error adding users to the group!');
    }
  }

 
  isSelected(user: any): boolean {
 
    return this.selecteduserList.some(selected => selected.username === user.username);
  }

  async getcurruntuserisfolloweduserlidt(userid: any):Promise<void>{
    const formData = new FormData();
    formData.append('userid', userid);
    formData.append('groupid', this.groupid);
  
    try {
      const response = await this.http.post<any>(`${this.APIURL}get_curruntuser_is_followed_list`, formData).toPromise();
     
  
      this.curruntuserisFollowedList = [];
  
      if (Array.isArray(response)) {
        response.forEach((user: any) => {
          if (user.profile) {
            user.profileBlobUrl = this.createBlobUrl(user.profile, 'image/jpeg');
          } else {
            user.profileBlobUrl = null;  
          }
  
          this.curruntuserisFollowedList.push(user);
        
        });
      } else if (response.message) {
        console.log(response.message);
        alert(response.message);
      }
  
    } catch (error) {
      console.error('There was an error!', error);
    }
  }








  
  async getCurrunUserDetailsOfGroup(userid: any): Promise<void> {
    const formData = new FormData();
    formData.append('groupid', this.groupid);
    formData.append('userid', userid);

 
 
    this.http.post(this.APIURL + 'get_curruntuser_detail_from_group', formData).subscribe({
      next: (response:any) => {
        this.currunusertype = response.usertype || 'user';
       
  

        
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });





    

   
}

  
  toggleDropdown(user: any): void {
 
    this.userList.forEach(u => {
        if (u !== user) {
            u.dropdownOpen = false;
        }
    });

 
    user.dropdownOpen = !user.dropdownOpen;

 
    this.cdr.detectChanges();
}
 


async changeusertype(user: any,userid: any, username: string,  usertype: string): Promise<void> {
  const confirmation = confirm(`Do you want to make ${username} as ${usertype}?`);
  if (!confirmation) {
    console.log('Change user type operation canceled.');
    return;  
  }

  const formData = new FormData();
  formData.append('groupid', this.groupid);
  formData.append('userid', userid);
  formData.append('curruntuserid', this.userid);
  formData.append('usertype', usertype);
  

  try {
    const response = await this.http.post<any>(`${this.APIURL}change_user_type_in_group`, formData).toPromise();
    console.log('Response from change_user_type_in_group endpoint:', response);
    this.getGroupDetails(this.groupid);
    this.toggleDropdown(user);
    this.getCurrunUserDetailsOfGroup(this.userid);

  } catch (error) {
    console.error('There was an error!', error);
 
  }
}


  


async changeusertypemodtouser(user: any, userid: any): Promise<void> {
  const confirmation = confirm(`Do you want to make yourself a user again?`);
  if (!confirmation) {
    console.log('Change user type operation canceled.');
    return;
  }

  const formData = new FormData();
  formData.append('groupid', this.groupid);
  formData.append('curruntuserid', this.userid);

  try {
    const response = await this.http.post<any>(`${this.APIURL}change_user_type_mod_into_user`, formData).toPromise();
    console.log('Response from change_user_type_mod_into_user endpoint:', response);
    

    this.getGroupDetails(this.groupid);
    this.toggleDropdown(user);
    this.getCurrunUserDetailsOfGroup(this.userid);

  } catch (error) {
    console.error('There was an error!', error);
  }
}





 

  async getnumberofgroupfollowers(groupid: any): Promise<void> {
    const formData = new FormData();
    formData.append('groupid', groupid);
   
  
    try {
      const response = await this.http.post<any>(`${this.APIURL}get_number_of_group_followers`, formData).toPromise();
 
      this.followerscount = response.count;
 
    
  
     
  
    } catch (error) {
      console.error('There was an error!', error);
    
    }
  }



  async joinedornottothegroup(userid: string, groupid: string): Promise<void> {
    const formData = new FormData();
    formData.append('groupid', groupid);
    formData.append('userid', userid);
  
    try {
      const response = await this.http.post<any>(`${this.APIURL}joined_or_not`, formData).toPromise();
      console.log('Response from joined_or_not endpoint:', response);
  
     
      if (response.message === 'yes') {
        this.btntext = "Leave group";
        this.isuserjoinggroup = true;

        
      } else {
        this.btntext = "Join now";
        this.isuserjoinggroup = false;

        
      }
  
    } catch (error) {
      console.error('There was an error!', error);
    }
  }


  getPostsFeed(): void {
    if (this.loading) return;
 

    this.loading = true;
    this.http.get<any[]>(`${this.APIURL}get_posts_feed_group?limit=${this.limit}&offset=${this.offset}&groupid=${this.groupid}`).subscribe({
      next: (res) => {
        this.groupposts = [...this.groupposts, ...this.processPosts(res)];
        console.log(this.groupposts);
        this.offset += this.limit;
        this.loading = false;
        this.cdr.detectChanges();  
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.loading = false;
      }
    });
  }

 private processPosts(posts: any[]): any[] {
    const processedPosts: any[] = [];
    posts.forEach(post => {
   
      const existingPost = processedPosts.find(p => p.postid  === post.postid );

      if (existingPost) {
        if (post.image) {
          existingPost.images.push(post.image);
        }
      } else {
        const newPost = {
          ...post,
          images: post.posttype === 'image' && post.image ? [post.image] : []
        };
        processedPosts.push(newPost);
      }
    });

    return processedPosts;
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

  addgrouppost():void{
    this.showaddpostgroup = true;
  }




  onPostAdded(): void {
    this.offset = 0;
    this.groupposts = [];
    this.getPostsFeed();  
  }



  async removeuser(user: any,userid: any,username:string):Promise<void>{

    const result = confirm("Do you need to remove " + username);
    if(result){
      const formData = new FormData();
      formData.append('userid', userid);
      formData.append('groupid', this.groupid);
      
  
      this.http.post<any>(`${this.APIURL}remove-user-from-group`, formData).subscribe({
        next: (response:any) => {
          this.getGroupDetails(this.groupid);
          this.toggleDropdown(user);
          
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error adding user:', error);
        }
      });
    }




    

  }


  // @HostListener('document:click', ['$event'])
  // closeAllDropdowns(event?: MouseEvent): void {
  //   this.post.showDropdown = false;
  //   this.cdref.detectChanges();
  // }

  

  async acceptuser(user: any, userid: any): Promise<void> {
    const formData = new FormData();
    formData.append('userid', userid);
    formData.append('groupid', this.groupid);
    formData.append('groupownerid', this.userid);
    formData.append('groupname', this.group.groupname);
 

  
    try {
      const response = await this.http.post<any>(`${this.APIURL}accept-user-from-group`, formData).toPromise();
      console.log(response.message);
  
 
      await this.getGroupDetails(this.groupid);
      this.toggleDropdown(user);
  
    } catch (error) {
      console.error('Error adding user:', error);
     
      alert('There was an error updating the user status. Please try again later.');
    }
  }



  async joingroup(groupid:any):Promise<void>{

       const formData = new FormData();
        formData.append('userid', this.userid);
        formData.append('groupid', groupid);


    if(this.btntext =="Leave group"){
      const result = confirm("Do you need to leavd the group?");
      if(result){
        this.btntext = "Join now";
        this.isuserjoinggroup = false;
        
        
    
        this.http.post<any>(`${this.APIURL}join-group`, formData).subscribe({
          next: (response:any) => {
            this.getGroupDetails(groupid);
            
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error adding user:', error);
          }
        });
      }

    }
    else if(this.btntext=="Join now"){
  

      this.btntext = "Leave group";
      this.isuserjoinggroup = true;

        this.http.post<any>(`${this.APIURL}join-group`, formData).subscribe({
          next: (response:any) => {
            this.getGroupDetails(groupid);
            
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error adding user:', error);
          }
        });
        

    }
    

    

    
  }


  async searchallusers(username: string): Promise<void> {
    const formData = new FormData();
    console.log(username);
  
    formData.append('username', username);
    formData.append('groupid', this.groupid);

    if (!username.trim()) {
        this.getcurruntuserisfolloweduserlidt(this.groupid);
        this.isstarttoseachrallusers = true;
      

        return;
    }

    this.http.post<any>(`${this.APIURL}search-all-users`, formData).subscribe({
        next: (response: any) => {
            console.log('Response from search-all-users endpoint:', response);

            if (response.message && response.message === 'No users found') {
                this.serachAllUsersList = [];  
            } else {
                this.isstarttoseachrallusers = true;
                this.serachAllUsersList = response.map((user: any) => {
                    if (user.profile) {
                        user.profileBlobUrl = this.createBlobUrl(user.profile, 'image/jpeg');
                    } else {
                        user.profileBlobUrl = null;  
                    }
                    return user;
                });
            }
        },
        error: (error: HttpErrorResponse) => {
            console.error('Error searching users:', error);
        }
    });
}



  async searchfollowers(username: string): Promise<void> {
    const formData = new FormData();
    formData.append('groupid', this.groupid);
    formData.append('username', username);

    if(!username.trim()){
      this.getGroupDetails(this.groupid);
    }

    this.http.post<any>(`${this.APIURL}search-follower-users`, formData).subscribe({
        next: (response: any) => {
            console.log(response.message);
              
            if (response.message && response.message === 'No users found') {
              
                this.userList = [];  
            } else {
           
                this.userList = response.map((user: any) => {
                    if (user.profileimage) {
                        user.profileBlobUrl = this.createBlobUrl(user.profileimage, 'image/jpeg');
                    } else {
                        user.profileBlobUrl = null;  
                    }
                    return user;
                });
            }
        },
        error: (error: HttpErrorResponse) => {
            console.error('Error searching users:', error);
        }
    });
}

  showhome():void{
   this.showhomeBool = true;
   this.showfollowersBool = false;
   this.showrequestsBool = false;
   this.showadduserBool = false;
   this.showsettingsBool = false;

  }

  showfollowers():void{
    this.showhomeBool = false;
   this.showfollowersBool = true;
   this.showrequestsBool = false;
   this.showadduserBool = false;
   this.showsettingsBool = false;

  }

  showrequests():void{
    this.showhomeBool = false;
   this.showfollowersBool = false;
   this.showrequestsBool = true;
   this.showadduserBool = false;
   this.showsettingsBool = false;

  }

  adduser():void{
    this.showhomeBool = false;
    this.showfollowersBool = false;
    this.showrequestsBool = false;
    this.showadduserBool = true;
    this.showsettingsBool = false;

  }


  settings():void{
    this.showhomeBool = false;
    this.showfollowersBool = false;
    this.showrequestsBool = false;
    this.showadduserBool = false;
    this.showsettingsBool = true;
  }

}
