import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, QueryList,
} from "@angular/core";

import { VTabComponent } from "./vtab.component";

@Component({
    selector: "bl-vtab-group",
    templateUrl: "vtab-group.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VTabGroupComponent implements AfterContentInit {
    @ContentChildren(VTabComponent) public tabs: QueryList<VTabComponent>;

    public currentTab: VTabComponent;

    constructor(private changeDetector: ChangeDetectorRef) {

    }
    public ngAfterContentInit() {
        this.currentTab = this.tabs.toArray().first();
        this.tabs.changes.subscribe((newTabs) => {
            if (!this.currentTab && newTabs.length > 0) {
                this.currentTab = newTabs.toArray().first();
            }
            this.changeDetector.markForCheck();
        });
        this.changeDetector.markForCheck();
    }

    public selectTab(tab: VTabComponent) {
        this.currentTab = tab;
        this.changeDetector.markForCheck();
    }

    public trackTab(index, tab: VTabComponent) {
        return index;
    }
}
