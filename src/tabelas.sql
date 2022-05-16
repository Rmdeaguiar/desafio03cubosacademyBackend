CREATE DATABASE dindin

DROP TABLE IF EXISTS usuarios 

CREATE TABLE usuarios (
  	id serial PRIMARY KEY, 
  	nome text NOT NULL, 
  	email text NOT NULL UNIQUE,
  	senha text NOT NULL		
)

DROP TABLE IF EXISTS categorias 

CREATE TABLE categorias (
  	id serial PRIMARY KEY, 
  	descricao text NOT NULL	
)

DROP TABLE IF EXISTS transacoes

CREATE TABLE transacoes (
  	id serial PRIMARY KEY, 
  	descricao text NOT NULL, 
  	valor int NOT NULL,
  	data timestamp DEFAULT NOW(),
  	categoria_id int NOT NULL REFERENCES categorias(id),
  	usuario_id int NOT NULL REFERENCES usuarios(id), 
  	tipo text NOT NULL
)

INSERT INTO categorias (descricao) VALUES ('Alimentação'), ('Casa'), ('Educação'), ('Lazer'), ('Saúde')