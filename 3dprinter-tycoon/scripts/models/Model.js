class Model {
    constructor(name, size, width, value, profile = null) {
        this.name = name; // Name of the model
        this.width = width
        this.value = value
        this.profile = profile
        if (profile) {
            this.size = profile.length
        } else {
            this.size = size
        }
    }
}

export default Model;
