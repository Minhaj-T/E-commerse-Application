

$(document).ready(function () {
    $('#user-signup').validate({
        rules: {
            name: {
                required: true,
                minlength: 4,
                maxlength: 20
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            email: {
                required: true,
                email: true
            },
            password: {
                minlength: 4,
                maxlength:8,
                required: true,
            }
        },
        messages: {
            name: {
                required: "Enter your name",
                minlength: "Enter at least 4 characters",
                maxlength: "Enter maximumm 20 caharacters"

            },
            phone: {
                required: "Enter your mobile number",
                number: "Enter a valid number",
                minlength: "Enter 10 numbers"
            },
            email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            },
            password: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters"
            }
        }
    })
})

//User Login

$(document).ready(function () {
    $('#userLogin').validate({
        rules: {
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            },
            password: {
                minlength: 4,
                required: true,
                maxlength: 8
            },
        },
        messages: {
            phone: {
                required: "Enter a mobile number",
                number: "Enter a valid mobile number",
                minlength: "Enter 10 numbers",
                maxlength: "Enter without country code"
            },
            password: {

                required: "Enter a password",
                minlength: "Password must be in 4-8 characters",
                maxlength: "Password must be in 4-8 characters"
            },
        }
    })

})

$(document).ready(function () {
    $('#loginOtp').validate({
        rules :{
            mobileNo:{
                required:true,
                number:true,
                minlength:10,
                maxlength:10
            }

        },
        messages :{
            mobileNo :{
            required:"Enter a mobile number",
            number: "Enter a valid mobile number",
            minlength: "Enter 10 numbers",
            maxlength: "Enter without country code"
        }
    }
    })
    })

    $(document).ready(function () {
        $('#otpFeald').validate({
            rules :{
                otp:{
                    required:true,
                    number:true,
                    minlength:4,
                    maxlength:4
                }
    
            },
            messages :{
                otp:{
                required:"Enter your otp number",
                number: "Enter a valid otp number",
                minlength: "Enter your 4 digit otp number"
                }
            }
        })
        })

        $(document).ready(function () {
            $('#adminLogin').validate({
                rules :{
                    email: {
                        required: true,
                        email: true
                    },
                    password: {
                        minlength: 4,
                        maxlength:8,
                        required: true,
                    }
                },
                messages :{
                    email: {
                        required: "Enter your Email",
                        email: "Enter a valid Email"
                    },
                    password: {
                        required: "Enter a password",
                        minlength: "Password must be in 4-8 characters"
                    }
                }
            })
            })    

 //Check out page of user

 $(document).ready(function () {
    $('#userChangePass').validate({
        rules: {
            current: {
                minlength: 4,
                required: true,
                maxlength: 8,
            },
            password1: {
                minlength: 4,
                required: true,
                maxlength: 8
            },
            password2: {
                minlength: 4,
                required: true,
                maxlength: 8
            },
        },
        messages: {
            current: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters",
                maxlength: "Password must be in 4-8 characters"
            },
            password1: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters",
                maxlength: "Password must be in 4-8 characters"
            },
            password2: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters",
                maxlength: "Password must be in 4-8 characters"
            },
        }
    })

})
 

$(document).ready(function () {

    $("#addNewAddress-form").validate({

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
        messages: {
            Name: {
                required: "Enter your name",
                minlength: "Enter at least 4 characters",
                maxlength: "Enter maximumm 20 caharacters"
            },
            House:{
                required: "Enter your House name",

            },
            Street:{
                required: "Enter your Street name",

            },
            Town:{
                required: "Enter your Town name",

            },
            PIN: {
                required: "Enter a PIN",
                minlength: "PIN must be in 6 characters",
            },
            Mobile :{
                required:"Enter a mobile number",
                number: "Enter a valid mobile number",
                minlength: "Enter 10 numbers",
                maxlength: "Enter without country code"
            },
            Email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            }
        }
    })

})

//---------------------------------------------------------------------------------------------------------
//admin side validation

$(document).ready(function () {
    $('#adminLogin').validate({
        rules :{
            email: {
                required: true,
                email: true
            },
            password: {
                minlength: 4,
                maxlength:8,
                required: true,
            }
        },
        messages :{
            email: {
                required: "Enter your Email",
                email: "Enter a valid Email"
            },
            password: {
                required: "Enter a password",
                minlength: "Password must be in 4-8 characters"
            }
        }
    })
    })  

    // add product form

$(document).ready(function () {
    $('#addProductForm').validate({
        rules: {
            name: {
                required: true,
                minlength: 5,
            },
            price: {
                required: true,
                number: true,
            },
            discription: {         
                required: true,
            },
            category: {         
                required: true,
            },
            image1: {
                required: true
            },
            image2: {
                required: true
            },
            image3: {
                required: true
            },
            image4: {
                required: true
            }
        },
        messages: {
            name: {
                required: "Enter your Product Name",
                minlength: "Enter at least 5 characters",
                
            },
            price: {
                required: "Enter the Price ",
                number: "Enter a valid number",
            },
            discription: {
                required: "Enter a Discription",
            },
            category: {
                required: "Select the Category",
            },
        }
    })

})

//the ctegory form validation

$(document).ready(function () {
    $('#addCategoryForm').validate({
        rules :{
            category: {
                required: true,
                text: true
            },
        },
        messages :{
            category: {
                required: "Enter the Category Name",
                text: "Enter a valid Email"
            },
        }
    })
    })    