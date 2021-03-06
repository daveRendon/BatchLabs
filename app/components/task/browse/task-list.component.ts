import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, forwardRef } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { TaskListDisplayComponent } from "./display";

import { ActivatedRoute } from "@angular/router";
import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Task } from "app/models";
import { TaskListParams, TaskParams, TaskService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { DeleteTaskAction } from "../action";

@Component({
    selector: "bl-task-list",
    templateUrl: "task-list.html",
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => TaskListComponent),
    }],
})
export class TaskListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public manualLoading: boolean;

    @Input() public set jobId(value: string) {
        this._jobId = (value && value.trim());
        this.refresh();
    }
    public get jobId() { return this._jobId; }

    @ViewChild(TaskListDisplayComponent)
    public list: TaskListDisplayComponent;

    public data: ListView<Task, TaskListParams>;

    private _jobId: string;
    private _baseOptions = { pageSize: 25 };
    private _onTaskAddedSub: Subscription;

    constructor(
        private taskService: TaskService,
        activatedRoute: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef,
        private taskManager: BackgroundTaskService) {
        super(changeDetectorRef);
        this.data = this.taskService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.data.status.subscribe((status) => {
            this.status = status;
        });

        this._onTaskAddedSub = taskService.onTaskAdded.subscribe((item: TaskParams) => {
            this.data.loadNewItem(taskService.get(item.jobId, item.id));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._onTaskAddedSub.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { jobId: this.jobId };
        this.data.setOptions(Object.assign({}, this._baseOptions));
        this.changeDetectorRef.detectChanges();

        return this.data.fetchNext(true);
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter: filter.toOData() });
        }

        this.data.fetchNext();
    }

    public onScrollToBottom(): Observable<any> {
        return this.data.fetchNext();
    }

    public deleteSelection(selection: ListSelection) {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteTaskAction(this.taskService, this.jobId, [...selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }
}
