(function ($) {
    $(document).ready(function () {
        let up = $("#up");
        $(".form-group").find("form").hide();
        let buffer_length;
        let extracted_data;

        // if scroll wheel has reached a certain point in the page
        // the scroll to top button will appear
        $(window).scroll(function () {
            if ($(this).scrollTop() > 20) {
                up.show();
            } else {
                up.hide();
            }
        });

        // function for scroll to top button
        up.click(function () {
            $('html, body').animate({scrollTop: 0}, 'slow');
        });

        // hides the table upon landing on the page
        $('#table1').hide();

        // function to extract/load data from the server
        let displayData = function (data) {
            $('#table1 tbody td').remove();
            $.each(data, function (index, i) {
                var row = $('<tr>');
                row.append($('<td>').text(i.id));
                row.append($('<td>').text(i.title));
                row.append($('<td>').text(i.description));
                row.append($('<td>').text(i.price));
                row.append($('<td>').text(i.discountPercentage));
                row.append($('<td>').text(i.rating));
                row.append($('<td>').text(i.stock));
                row.append($('<td>').text(i.brand));
                row.append($('<td>').text(i.category));
                row.append($('<td>').html(`<img src="${i.thumbnail}" alt="${i.title} thumbnail" width="50">`));
                // create a cell for images
                var imagesCell = $('<td>');
                $.each(i.images, async function (index, image) {
                    var imgTag = $('<img>').attr('src', image);
                    await imagesCell.append(imgTag);
                });
                row.append(imagesCell);
                $('#table1 tbody').append(row);
            });
        }

        let displayOne = function (data) {
            $('#table1 tbody td').remove();
            var row = $('<tr>');
            row.append($('<td>').text(data.id));
            row.append($('<td>').text(data.title));
            row.append($('<td>').text(data.description));
            row.append($('<td>').text(data.price));
            row.append($('<td>').text(data.discountPercentage));
            row.append($('<td>').text(data.rating));
            row.append($('<td>').text(data.stock));
            row.append($('<td>').text(data.brand));
            row.append($('<td>').text(data.category));
            row.append($('<td>').html(`<img src="${data.thumbnail}" alt="${data.title} thumbnail" width="50">`));
            // create a cell for images
            var imagesCell = $('<td>');
            $.each(data.images, async function (index, image) {
                var imgTag = $('<img>').attr('src', image);
                await imagesCell.append(imgTag);
            });
            $('#table1 tbody').append(row);
        }

        $.getJSON("/get-all-products", function (data) {
            // used to debug json data
            //console.log(data)
            extracted_data = data;
            buffer_length = extracted_data.length;
            buffer_length++;
        }).fail(function (textStatus, error) {
            // This code executes if there is an error retrieving the data
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

        // when button is clicked, it will send a get request to the server
        // this will retrieve the json data from the server
        // the data is then displayed onto the webpage
        $("#btn1").click(function () {
            $('#table1').show();
            displayData(extracted_data);
            //console.log(extracted_data);
        })

        // handle form submission
        $("#form-search").submit(function (event) {
            // prevent the default form submission behavior
            event.preventDefault();

            // get the search query entered by the user
            var query = $("#find-product-input").val();

            if (query != null) {
                $('#table1').show();
                // make an AJAX request to the server to get the filtered data
                $.getJSON('/find-product', {query: query}, function (searchedData) {
                    // display the filtered data in a table
                    displayOne(searchedData);
                    //console.log(filteredData);
                });
            }
        });

        $("#filter-form").submit(function (event) {
            // prevent the default form submission behavior
            event.preventDefault();

            // get the filter query checked by the user
            var category = $("#filter-form .category").val();

            var filters = {
                "category": category
            }

            $('#table1').show();
            // make an AJAX request to the server to get the filtered data
            $.post('/filter-product', filters, function (filteredData) {
                // display the filtered data in a table
                displayData(filteredData);
                //console.log(filteredData);
            });
        });

        // function to hide forms that are not the current toggled form
        let hideform = function (form) {
            $(".form-group").find("form").not(form).slideUp();
        }

        // when the button is clicked, it will slide down the form
        $("#btn2").click(function () {
            var form = $("#add-form");
            form.slideToggle();
            hideform(form);
        });

        $("#btn3").click(function () {
            var form = $("#modify-form");
            form.slideToggle();
            hideform(form);
        });

        $("#btn4").click(function () {
            var form = $("#delete-form");
            form.slideToggle();
            hideform(form);
        });

        $("#btn5").click(function () {
            var form = $("#filter-form");
            form.slideToggle();
            hideform(form);
        });

        // adds a new color to the json
        $('#add-form').submit(function (event) {
            // prevent the form from submitting and reloading the page
            event.preventDefault();

            // get the values of the input fields
            var title = $('#add-form .title').val();
            var description = $('#add-form .description').val();
            var price = $('#add-form .price').val();
            var discountPer = $('#add-form .discountPer').val();
            var rating = $('#add-form .rating').val();
            var stock = $('#add-form .stock').val();
            var brand = $('#add-form .brand').val();
            var category = $('#add-form .category').val();

            // create the new color object
            var newProduct = {
                "id": buffer_length,
                "title": title,
                "description": description,
                "price": price,
                "discountPercentage": discountPer,
                "rating": rating,
                "stock": stock,
                "brand": brand,
                "category": category
            };

            //console.log(newProduct);


            // send the new color object to the server
            $.post("/add-product", newProduct, function (response) {
                console.log(response);
                location.reload();
            });
        });

        // modify an existing color within the json
        $('#modify-form').submit(function (event) {
            event.preventDefault(); // prevent the form from submitting normally

            // get the values of the input fields
            var id = $('#modify-form .id').val();
            var title = $('#modify-form .title').val();
            var description = $('#modify-form .description').val();
            var price = $('#modify-form .price').val();
            var discountPer = $('#modify-form .discountPer').val();
            var rating = $('#modify-form .rating').val();
            var stock = $('#modify-form .stock').val();
            var brand = $('#modify-form .brand').val();
            var category = $('#modify-form .category').val();

            // create the new color object
            var updatedProduct = {
                "id": id,
                "title": title,
                "description": description,
                "price": price,
                "discountPercentage": discountPer,
                "rating": rating,
                "stock": stock,
                "brand": brand,
                "category": category
            };

            //console.log(updatedProduct)

            $.ajax({
                url: '/update-product' + id,
                type: 'PUT',
                data: updatedProduct,
                success: function (response) {
                    console.log('PUT request successful', response);
                    location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error making PUT request:', errorThrown);
                }
            });
        });

        // modify an existing color within the json
        $('#delete-form').submit(function (event) {
            event.preventDefault(); // prevent the form from submitting normally

            // get the form values
            var id = $('#delete-form .id').val();

            $.ajax({
                url: '/delete-product' + id,
                type: 'DELETE',
                data: null,
                success: function (response) {
                    console.log('PUT request successful', response);
                    location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error making DELETE request:', errorThrown);
                }
            });
        });
    });
})(jQuery);

