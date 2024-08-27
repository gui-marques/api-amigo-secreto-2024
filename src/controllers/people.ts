import { RequestHandler } from "express";
import * as people from "../services/people";
import { z } from "zod";
import { decryptMatch } from "../utils/match";

// Verifica se o CPF já está cadastrado
const checkCpfExists = async (cpf: string): Promise<boolean> => {
  return people.cpfExists(cpf);
};
export const getAll: RequestHandler = async (req, res) => {
  const { id_event, id_group } = req.params;

  try {
      const items = await people.getAll({
          id_event: parseInt(id_event, 10),
          id_group: parseInt(id_group, 10),
      });

      if (Array.isArray(items) && items.length > 0) {
          return res.json({ people: items });
      }

      res.status(404).json({ error: "Nenhuma pessoa encontrada" });
  } catch (error) {
      console.error("Erro ao obter pessoas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getPerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;

  try {
    const personItem = await people.getOne({
      id: parseInt(id, 10),
      id_event: parseInt(id_event, 10),
      id_group: parseInt(id_group, 10),
    });

    if (personItem) {
      return res.json({ person: personItem });
    }

    res.status(404).json({ error: "Pessoa não encontrada" });
  } catch (error) {
    console.error("Erro ao obter pessoa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const addPerson: RequestHandler = async (req, res) => {
  const { id_event, id_group } = req.params;

  const addPersonSchema = z.object({
    name: z.string(),
    cpf: z.string().transform((val) => val.replace(/\.|-/gm, "")),
    setor: z.string(),
    chave: z.string()
  });

  const body = addPersonSchema.safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const { cpf, name, setor, chave } = body.data;

  // Verifica se o CPF já existe
  const cpfExists = await checkCpfExists(cpf);
  if (cpfExists) {
    return res.status(400).json({ error: "CPF já cadastrado" });
  }

  try {
    const newPerson = await people.add({
      name,
      cpf,
      setor,
      chave,
      id_event: parseInt(id_event, 10),
      id_group: parseInt(id_group, 10)
    });

    if (newPerson) {
      return res.status(201).json({ person: newPerson });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  } catch (error) {
    console.error("Erro ao adicionar pessoa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updatePerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;

  const updatePersonSchema = z.object({
    name: z.string().optional(),
    cpf: z.string().transform((val) => val.replace(/\.|-/gm, "")).optional(),
    setor: z.string().optional(),
    chave: z.string().optional(),
    matched: z.string().optional(),
  });

  const body = updatePersonSchema.safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    const updatePerson = await people.update(
      {
        id: parseInt(id, 10),
        id_event: parseInt(id_event, 10),
        id_group: parseInt(id_group, 10),
      },
      body.data
    );

    if (updatePerson) {
      const personItem = await people.getOne({
        id: parseInt(id, 10),
        id_event: parseInt(id_event, 10),
        id_group: parseInt(id_group, 10),
      });
      return res.json({ person: personItem });
    }

    res.status(404).json({ error: "Pessoa não encontrada" });
  } catch (error) {
    console.error("Erro ao atualizar pessoa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deletePerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;

  try {
    const deletePerson = await people.remove({
      id: parseInt(id, 10),
      id_event: parseInt(id_event, 10),
      id_group: parseInt(id_group, 10),
    });

    if (deletePerson) {
      return res.json({ person: deletePerson });
    }

    res.status(404).json({ error: "Pessoa não encontrada" });
  } catch (error) {
    console.error("Erro ao deletar pessoa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Aqui inicia a rota para web
export const searchPerson: RequestHandler = async (req, res) => {
  const { id_event } = req.params;

  const searchPersonSchema = z.object({
    cpf: z.string().transform((val) => val.replace(/\.|-/gm, "")),
    chave: z.string()
  });

  const query = searchPersonSchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    const personItem = await people.getOne({
      id_event: parseInt(id_event, 10),
      cpf: query.data.cpf,
      chave: query.data.chave
    });

    if (personItem && personItem.metched) {
      const matchId = decryptMatch(personItem.metched);

      const personMatched = await people.getOne({
        id_event: parseInt(id_event, 10),
        id: matchId,
      });

      if (personMatched) {
        return res.json({
          person: {
            id: personItem.id,
            name: personItem.name,
          },
          personMatched: {
            id: personMatched.id,
            name: personMatched.name,
            setor: personMatched.setor,
          },
        });
      }
    }

    res.status(404).json({ error: "Pessoa não encontrada" });
  } catch (error) {
    console.error("Erro ao buscar pessoa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
