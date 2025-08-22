
//Base Repository for all database models

class BaseRepository {

    constructor(model) {
        this.model = model;
    }

    // Find By Id
    async findById(id, options = {}) {
        return this.model.findUnique({
            where: { id },
            ...options,
        });
    }

    // Find Many
    async findMany(options = {}) {
        return this.model.findMany({
            ...options,
        });
    }

    // Create
    async create(data, options = {}) {
        return this.model.create({
            data,
            ...options,
        });
    }

    // delete - mark as deleted
    async delete(id, options = {}) {
        return this.model.update({
            where: { id },
            data: { deleted: true },
            ...options,
        });
    }

}

export default BaseRepository;