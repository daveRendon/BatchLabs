import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";

import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DeleteContainerAction } from "app/components/data/action";
import { StorageService } from "app/services";

@Component({
    selector: "bl-delete-container-dialog",
    templateUrl: "delete-container-dialog.html",
})
export class DeleteContainerDialogComponent {
    public id: string;
    public name: string;

    constructor(
        public dialogRef: MatDialogRef<DeleteContainerDialogComponent>,
        private storageService: StorageService,
        private taskManager: BackgroundTaskService) {
    }

    @autobind()
    public destroy() {
        const task = new DeleteContainerAction(this.storageService, [this.id]);
        task.startAndWaitAsync(this.taskManager);

        return task.actionDone;
    }
}
