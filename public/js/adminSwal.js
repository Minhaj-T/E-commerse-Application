
//block the user
function blockUser(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to Block " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Blocked!',
                'User has been blocked.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//2)Unblock the user
function unblockUser(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to unblock " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Unblocked!',
                'User has been Unblocked.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//3) delete product
function deleteproduct(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'product has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//4) delete category
function deleteCategory(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Brand has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}

function deleteBanner(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Brand has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}





