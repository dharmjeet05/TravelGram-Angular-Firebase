import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

// rxjs
import { finalize } from 'rxjs/operators';

// Firebase
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';

// Browser-Image-Resizer
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from 'src/utils/config';

// Uuid
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  picture: string =
    'https://images.pexels.com/photos/7775641/pexels-photo-7775641.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260';
  uploadPercent: number = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onSubmit(f: NgForm) {
    const { email, password, username, country, bio, name } = f.form.value;

    this.auth
      .signUp(email, password)
      .then((res) => {
        console.log(res);
        const { uid } = res.user;

        this.db.object(`/users/${uid}`).set({
          id: uid,
          name: name,
          email: email,
          instaUserName: username,
          country: country,
          bio: bio,
          picture: this.picture,
        });
      })
      .then(() => {
        this.router.navigateByUrl('/');
        this.toastr.success('SignUp Success');
      })
      .catch((err) => {
        console.log(err);
        this.toastr.error('Signup Failed');
      });
  }

  async uploadFile(event) {
    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath = uuidv4();
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('image upload success');
          });
        })
      )
      .subscribe();
  }
}
