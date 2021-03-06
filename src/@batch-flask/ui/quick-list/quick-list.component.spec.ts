import { Component, DebugElement, NO_ERRORS_SCHEMA, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { ListSelection } from "@batch-flask/core/list";
import { BreadcrumbModule } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import { FocusSectionComponent } from "@batch-flask/ui/focus-section";
import {
    QuickListComponent, QuickListItemComponent, QuickListItemStatusComponent,
} from "@batch-flask/ui/quick-list";
import { ButtonClickEvents, click } from "test/utils/helpers";
import { virtualScrollMockComponents } from "test/utils/mocks/components";

interface TestItem {
    id: string;
    name: string;
}
// tslint:disable:trackBy-function
@Component({
    template: `
        <bl-focus-section #focusSection style="height: 1000px">
            <bl-quick-list>
                <bl-quick-list-item *ngFor="let item of items" [key]="item.id">
                    <div bl-quick-list-item-title>{{item.name}}</div>
                </bl-quick-list-item>
            </bl-quick-list>
        </bl-focus-section>
    `,
})
class TestComponent {
    @ViewChild("focusSection")
    public focusSection: FocusSectionComponent;

    public items: TestItem[] = [
        { id: "item-1", name: "Item 1" },
        { id: "item-2", name: "Item 2" },
        { id: "item-3", name: "Item 3" },
        { id: "item-4", name: "Item 4" },
        { id: "item-5", name: "Item 5" },
    ];
}

describe("QuickListComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let quicklist: QuickListComponent;
    let items: DebugElement[];

    let activeItemKey: string = null;
    let selection: ListSelection;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BreadcrumbModule, RouterTestingModule],
            declarations: [
                TestComponent, FocusSectionComponent,
                ...virtualScrollMockComponents,
                QuickListComponent,
                QuickListItemComponent,
                QuickListItemStatusComponent,
            ],
            providers: [
                { provide: ContextMenuService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-quick-list"));
        quicklist = de.componentInstance;
        quicklist.activeItemChange.subscribe(x => activeItemKey = x);
        quicklist.selectionChange.subscribe(x => selection = x);
        fixture.detectChanges();
        items = de.queryAll(By.css(".quick-list-item"));
    });

    it("should display all the content", () => {
        expect(items.length).toBe(5);
        expect(items[0].nativeElement.textContent).toContain("Item 1");
        expect(items[1].nativeElement.textContent).toContain("Item 2");
        expect(items[2].nativeElement.textContent).toContain("Item 3");
        expect(items[3].nativeElement.textContent).toContain("Item 4");
        expect(items[4].nativeElement.textContent).toContain("Item 5");
    });

    it("click on an item should make the item active", () => {
        click(items[1]);
        fixture.detectChanges();
        expect(activeItemKey).toEqual("item-2");
        expect(items[1].componentInstance.active).toBe(true);

        expect(selection.keys.size).toBe(1, "Should also select the item");
        expect(selection.keys.has("item-2")).toBe(true, "Should also select the item");
    });

    it("click on an item should also focus it", () => {
        const item = items[1];
        testComponent.focusSection.focus();

        click(item.nativeElement);
        fixture.detectChanges();
        expect(quicklist.focusedItem.value).toEqual("item-2");
    });

    describe("When an item is active", () => {
        beforeEach(() => {
            quicklist.activeItem = "item-2";
            fixture.detectChanges();
        });

        it("Should have item initialy active", () => {
            expect(items[1].componentInstance.active).toBe(true);
        });

        it("Shift click should select all items between current active and clicked", () => {
            click(items[3], ButtonClickEvents.leftShift);
            fixture.detectChanges();
            expect(activeItemKey).toEqual("item-2", "Should not have changed active item");
            expect(selection.keys.size).toBe(3);
            expect(selection.keys.has("item-2")).toBe(true);
            expect(selection.keys.has("item-3")).toBe(true);
            expect(selection.keys.has("item-4")).toBe(true);
        });

        it("Ctrl click should select on item + the active item", () => {
            click(items[3], ButtonClickEvents.leftCtrl);
            fixture.detectChanges();
            expect(activeItemKey).toEqual("item-2", "Should not have changed active item");

            expect(selection.keys.size).toBe(2);
            expect(selection.keys.has("item-2")).toBe(true, "has item-2");
            expect(selection.keys.has("item-4")).toBe(true, "has item-4");

            click(items[4], ButtonClickEvents.leftCtrl);
            expect(selection.keys.size).toBe(3);

            expect(selection.keys.has("item-2")).toBe(true, "has item-2");
            expect(selection.keys.has("item-4")).toBe(true, "has item-4");
            expect(selection.keys.has("item-5")).toBe(true, "has item-5");
        });

        it("Ctrl click on a selected item should unselect", () => {
            click(items[3], ButtonClickEvents.leftCtrl);
            click(items[4], ButtonClickEvents.leftCtrl);
            fixture.detectChanges();
            expect(selection.keys.size).toBe(3);
            click(items[3], ButtonClickEvents.leftCtrl);
            expect(selection.keys.size).toBe(2);
            expect(selection.keys.has("item-2")).toBe(true);
            expect(selection.keys.has("item-5")).toBe(true);

            click(items[4], ButtonClickEvents.leftCtrl);

            expect(selection.keys.size).toBe(1, "Should not have unselected the active");
            expect(selection.keys.has("item-2")).toBe(true, "Should not have unselected the active");
        });
    });
});
