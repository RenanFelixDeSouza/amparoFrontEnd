import React, { useState } from "react";
import "./ListCategories.css";
import Table from "../../Shared/Table.js";

function ListCategories() {
    const [categories] = useState([
        {
            id: 1,
            image: "http://amparoserver.test:8080/storage/uploads/photos/renan_f_souza_20250326203112.png",
            name: "DOG 1",
            description: "Descrição da dog 1",
        },
        {
            id: 2,
            image: "http://amparoserver.test:8080/storage/uploads/photos/renan_f_souza_20250326203112.png",
            name: "DOG 2",
            description: "Descrição da dog 2",
        },
        {
            id: 3,
            image: "http://amparoserver.test:8080/storage/uploads/photos/renan_f_souza_20250326203112.png",
            name: "DOG 3",
            description: "Descrição da dog 3",
        },
    ]);

    const columns = [
        {
            key: "image",
            label: "Imagem",
            render: (image) => (
                <img
                    src={image || "https://placehold.co/600x400"}
                    alt="Categoria"
                    onError={(e) => {
                        e.target.onerror = null; // Evita loop infinito
                        e.target.src = "https://placehold.co/600x400"; // Define uma imagem padrão
                    }}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%" }}
                />
            ),
        },
        { key: "name", label: "Nome" },
        { key: "description", label: "Descrição" },
    ];

    const getActionItems = (categoryId) => [
        { label: "Editar", action: () => console.log(`Editar categoria ${categoryId}`) },
    ];

    return (
        <div className="categories-list-container">
            <h2>Listar Animais</h2>
            <Table
                data={categories}
                columns={columns}
                itemsPerPage={5}
                isSortable={true}
                handleSort={() => { }}
                getActionItems={getActionItems}
            />
        </div>
    );
}

export default ListCategories;
