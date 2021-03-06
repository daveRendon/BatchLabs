import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { ButtonsModule } from "@batch-flask/ui/buttons";
import { ScrollableModule } from "@batch-flask/ui/scrollable";
import { BrowseLayoutAdvancedFilterDirective } from "./browse-layout-advanced-filter";
import { BrowseLayoutListDirective } from "./browse-layout-list";
import { BrowseLayoutComponent } from "./browse-layout.component";

const privateComponents = [];
const publicComponents = [BrowseLayoutComponent, BrowseLayoutListDirective, BrowseLayoutAdvancedFilterDirective];

@NgModule({
    imports: [ScrollableModule, BrowserModule, FormsModule, ReactiveFormsModule, ButtonsModule, RouterModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class BrowseLayoutModule {
}
