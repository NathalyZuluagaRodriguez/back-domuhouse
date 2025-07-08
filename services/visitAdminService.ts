import visitRepository from '../repositories/visitAdminRepository'

const getAllVisits = async () => {
  return await visitRepository.getAllVisits()
}

export default {
  getAllVisits
}
