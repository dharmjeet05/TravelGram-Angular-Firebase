import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  email = null;
  name = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    setInterval(() => {
      this.auth.getUser().subscribe((user) => {
        console.log('USER IS: ', user);

        this.name = user.displayName;
        this.email = user?.email;
      });
      // the following is required, otherwise the view will not be updated
      this.email.markForCheck();
    }, 1000);
  }

  ngOnInit(): void {}

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log(changes);
  // }

  async handleSignOut() {
    try {
      await this.auth.signOut();

      this.router.navigateByUrl('/signin');

      this.toastr.info('Logout success');
      this.email = null;
    } catch (error) {
      this.toastr.error('Problem in SignOut');
    }
  }
}
