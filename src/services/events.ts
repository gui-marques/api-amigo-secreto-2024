import { PrismaClient, Prisma } from "@prisma/client";
import * as people from './people'
import * as groups from './groups'
import { number } from "zod";
import { encryptMatch } from "../utils/match";


const prisma = new PrismaClient();

export const getAll = async () => {
  try {
    return await prisma.event.findMany();
  } catch (err) {
    return false;
  }
};

export const getOne = async (id: number) => {
  try {
    return await prisma.event.findFirst({ where: { id } });
  } catch (err) {
    return false;
  }
};


type EventsCreateData = Prisma.Args<typeof prisma.event, 'create'>['data'];

export const add = async (data: EventsCreateData) => {
  try{
 return await prisma.event.create({ data });
  }catch(err){return false  }
}

type EventsUpdateData = Prisma.Args<typeof prisma.event, 'update'>['data'];
export const update = async(id: number, data:EventsUpdateData) => {
  try{
      return await prisma.event.update({ where: { id }, data});
  }catch(err){ return false}
}


export const remove = async(id: number) => {
 try{
  return await prisma.event.delete({ where: { id }});
 }catch(err){ return false}
}

export const doMatches = async (id: number):Promise<boolean> => {


const eventItem = await prisma.event.findFirst({ where: { id }, select: {grouped: true}});
if(eventItem) {
  const peopleList = await people.getAll({ id_event: id });
  if(peopleList) {
    let sortedList: {id: number, metch: number }[] = [];
    let sortable: number[] = [];

    let attempts = 0;
    let maxAttempts = peopleList.length;
    let keepTrying = true;
    while(keepTrying && attempts < maxAttempts){
        keepTrying = false;
        attempts++;
        sortedList = [];
        sortable = peopleList.map(item => item.id);
        for(let i in peopleList) {
          let sortableFilted: number[] = sortable;
          if(eventItem.grouped){
            sortableFilted = sortable.filter(sortableItem => {
              let sortablePerson = peopleList.find( item => item.id === sortableItem)
              return peopleList[i].id_group !== sortablePerson?.id_group;
            })
          }
          if(sortableFilted.length === 0  ||(sortableFilted.length ===1 && peopleList[i].id === sortableFilted[0])){
            keepTrying = true;
          }else{
              let sortedIndex = Math.floor(Math.random() * sortableFilted.length);
              while(sortableFilted[sortedIndex] === peopleList[i].id){
                sortedIndex = Math.floor(Math.random() * sortableFilted.length);
              }
              sortedList.push({
                id: peopleList[i].id,
                metch: sortableFilted[sortedIndex]
              });
             sortable = sortable.filter(item => item !== sortableFilted[sortedIndex]);
          }
        }
    }
    if(attempts < maxAttempts){
              for(let i in sortedList){
                await people.update({
                  id: sortedList[i].id,
                  id_event: id
                }, {metched: encryptMatch(sortedList[i].metch)}); // criar encyptmatch()
              }
              return true;
    }
  }
}
        return false; 
}