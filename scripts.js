import { html, createOrderHtml, updateDraggingHtml, moveToColumn} from "./view.js";
import { createOrderData } from "./data.js";


/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */
let column = null
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || event.composedPath()
    

    for (const element of path) {
        const { area } = element.dataset
        if (area) {
            column = area
            break;
        }
    }

    if (!column) return
updateDraggingHtml({ over: column })
    
}


const handleHelpToggle = (event) => {
    if (html.help.overlay.open) {
    html.help.overlay.close()
    } else html.help.overlay.showModal()
}

const handleAddToggle = (event) => {
    if (html.add.overlay.open) {
        html.add.overlay.close();
        html.add.form.reset();
    } else html.add.overlay.showModal()
}

const handleAddSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const order = createOrderData(data)
    order.column = 'ordered'

    html.columns[(order.column)].appendChild(createOrderHtml(order))
    html.add.overlay.close();
    html.add.form.reset();
}
let currentTargetOrder = {}
const handleEditToggle = (event) => {

    if (event.target.classList.contains('order')) {
        html.edit.overlay.showModal()
    } else 
    html.edit.overlay.close()
    html.edit.form.reset();
    
    currentTargetOrder = event.target.dataset
    return currentTargetOrder
}

const handleEditSubmit = (event) => {
    event.preventDefault()
    
    const editFormData = new FormData(event.target);
    const data = Object.fromEntries(editFormData);
    const { id, title, table, column } = data

    const orderToEdit = document.querySelector(`[data-id="${currentTargetOrder['id']}"]`)
    orderToEdit.children[0].innerText = title
    orderToEdit.children[1].children[0].children[1].innerText = table
    moveToColumn(currentTargetOrder['id'], column)

    html.edit.overlay.close()
    html.edit.form.reset()
}
const handleDelete = (event) => {
    document.querySelector(`[data-id="${currentTargetOrder['id']}"]`).remove()
    html.edit.overlay.close()
}



const handleDragEnd = (event) => {
   moveToColumn(event.target.dataset.id, column)
   console.log(event.target.dataset)
}

html.add.cancel.addEventListener('click', handleAddToggle)
html.other.add.addEventListener('click', handleAddToggle)
html.add.form.addEventListener('submit', handleAddSubmit)

html.other.grid.addEventListener('click', handleEditToggle)
html.edit.cancel.addEventListener('click', handleEditToggle)
html.edit.form.addEventListener('submit', handleEditSubmit)
html.edit.delete.addEventListener('click', handleDelete)

html.help.cancel.addEventListener('click', handleHelpToggle)
html.other.help.addEventListener('click', handleHelpToggle)

for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragend', handleDragEnd)
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver)
}
