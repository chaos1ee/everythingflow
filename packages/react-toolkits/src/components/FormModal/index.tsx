import OriginalFormModal from './FormModal'
import useModal from './useModal'

const FormModal = OriginalFormModal as typeof OriginalFormModal & {
  useModal: typeof useModal
}

FormModal.useModal = useModal

export default FormModal
