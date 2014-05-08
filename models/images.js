function ImagesDAO(db){
	"use strict";

	/* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ImagesDAO)) {
        console.log('Warning: ImageDAO constructor called without "new" operator');
        return new ImagesDAO(db);
    }

    var images = db.collection("images");

    this.add = function(file, callback){
    	"use strict";

    	var image = {
    		"name" : file.name,
    		"image_path" : file.image,
            "type": file.type,
            "size": file.size,
            "insert_date": file.insert_date
    	}

    	images.insert(image, function(err, result){
    		"use strict";

    		if(err) return callback(err);

    		console.log("Insert new image");
    		callback(err);
    	});
    }

    this.getImages = function(callback){
    	"use strict";

    	images.find().sort('name',1).toArray(function(err, items){
    		"use strict";

    		if (err){ 
                return callback(err, null)
            };

            callback(err, items);
    	});
    }

    this.getImage = function(name, callback){
        "use strict";

        images.find().sort('name',1).toArray(function(err, items){
            "use strict";

            if (err){ 
                return callback(err, null)
            };

            callback(err, items);
        });
    }
}

module.exports.ImagesDAO = ImagesDAO;