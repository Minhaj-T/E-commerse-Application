$(document).ready(function () {

    $("#checkout-form").validate({

        rules: {
            Name: {
                required: true,
                minlength: 5,
                maxlength: 20
            },
            House: {
                required: true
            },
            Street: {
                required: true
            },
            Town: {
                required: true
            },
            PIN: {
                required: true,
                number: true,
                minlength: 6,
                maxlength: 6
            },
            Mobile: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            Email: {
                required: true,
                email: true
            }



        },
        submitHandler: function (form) {

            $.ajax({
                url:'/place-order',
                method:'post',
                data:$('#checkout-form').serialize(),
                success:(response)=>{
                    if(response.codSuccess){
                        location.href='/order-success'

                        
                    }else if(response.razorpay){

                        razorpayPayment(response.resp)
                        
                    }else if(response) {
                        location.href = response.url
                    }
                }
            })
        }
    })

})


function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_oD6aFb3225oHrK", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Minhaj T",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)

            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Minhaj T",
            "email": "minhajt.mh@gmail.col",
            "contact": "9876543210"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
                        

}

function verifyPayment(response, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            response,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/order-success'
            } else {
                location.href = '/cancelled'
            }
            
        }
    })
}







function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)

            }
        }
    })
}

//cahnge the quantity of the product thorough the ajax 
function changeQuantity(cartId,proId,count,userId){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            user:userId,
            quantity:quantity
        },
        method:'post',
        success:((response)=>{
            if(response.removeProduct){
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      Swal.fire(
                        'Deleted!',
                        'Your file has been deleted.',
                        'success'
                      )
                      location.reload()
                    }
                  })
            }else{
                console.log(response);
                document.getElementById(proId).innerHTML=quantity+count
                document.getElementById('total').innerHTML=response.total
            }
        })
    })

}

//remove the item int00 the cart


//remove the cart items
function removeCartItem(cartId, proId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/delete-cart-product',
                data: {
                    cart: cartId,
                    product: proId,

                },
                method: 'post',
                success: (response) => {
                    if(response) {
                        location.reload()

                    } else {
                        alert("some error")
                    }
                }
            })
            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            )
            location.reload()

        }
    })
}



//Cancel the order in to my orders
function cancelOrder(orderId,total) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to Cancel this order",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url:'/cancel-order',
                data: {
                    orderId: orderId,
                    Total:total
                },
                method:'post',
                success:((response)=>{
                    if(response.status){
                        location.reload()
                    }else {
                        alert("some error")
                    }
                })
            })
            Swal.fire(
                'Canceled!',
                'Your file has been deleted.',
                'success'
            )
            location.reload()

        }
    })
}







