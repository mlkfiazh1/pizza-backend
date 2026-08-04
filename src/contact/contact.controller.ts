import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './contact.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EnumRole } from '../common/enum';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Auth(EnumRole.GUEST, EnumRole.USER)
  @Post()
  async save(@Body() payload: ContactDto) {
    await this.contactService.save(payload);

    return { message: 'Contact created successfully' };
  }
}
